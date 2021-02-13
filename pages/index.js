import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import gndCtrlTheme from "../styles/gnd-ctrl-standard-theme.js";
import { Grommet, Box, Button, grommet } from "grommet";
import { deepMerge } from "grommet/utils";
import BluetoothConnectButton from "../components/bluetooth-connect-button";
import ProfileRunner from "../components/profile-runner";
import bloomingEspresso from "../profiles/blooming-espresso";

const Chart = dynamic(() => import("../components/chart"), { ssr: false });

const theme = deepMerge(grommet, gndCtrlTheme);

// https://googlechrome.github.io/samples/web-bluetooth/discover-services-and-characteristics.html

// console.log('conect', navigator.bluetooth);

export default function Home() {
  const PRESSURE_ID = 0xffe1;

  // const [startTime, _setStartTime] = useState(Date.now());
  const startTime = useRef(Date.now());
  const setStartTime = (time) => {
    startTime.current = time;
  };

  const [profile, setProfile] = useState(new bloomingEspresso());
  const [isRunning, setIsRunning] = useState(false);

  const [sensorData, updateSensorData] = useState([{ bars: 0, t: 0 }]);
  const [actualPressure, setActualPressure] = useState(0);

  const [profileData, setProfileData] = useState([]);

  const [comGndBtDevice, setComGndBtDevice] = useState();
  const [comGndBtService, setComGndBtService] = useState();
  const [
    comGndBtPressureCharacteristic,
    setComGndBtPressureCharacteristic,
  ] = useState();

  const [btConnected, setBtConnected] = useState(false);

  useEffect(async () => {
    if (!comGndBtPressureCharacteristic) {
      if (comGndBtService) {
        try {
          const characteristic = await comGndBtService.getCharacteristic(
            PRESSURE_ID
          );
          setComGndBtPressureCharacteristic(characteristic);
        } catch (error) {
          console.error("Bluetooth Error", error);
        }
      }
    }
    if (comGndBtPressureCharacteristic) {
      comGndBtPressureCharacteristic.startNotifications();
      comGndBtPressureCharacteristic.addEventListener(
        "characteristicvaluechanged",
        handleCharacteristicValueChanged
      );
    }
    return () => {
      if (comGndBtPressureCharacteristic) {
        comGndBtPressureCharacteristic.removeEventListener(
          "characteristicvaluechanged",
          handleCharacteristicValueChanged
        );
      }
    };
  }, [comGndBtDevice, comGndBtService, comGndBtPressureCharacteristic]);

  const timeShiftData = (data, newDatum) => {
    // return data;
    const allData = [...data, newDatum].map((datum, i) => {
      return i > 0 ? Object.assign({}, datum, { t: data[i - 1].t }) : datum;
    });
    allData.shift();
    return allData;
  };

  const handleCharacteristicValueChanged = (event) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTCharacteristic/readValue
    // readValue returns a promise for a DataView object
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
    // the value is sent as an ascii byte array
    const textDecoder = new TextDecoder("ascii");
    const pressure = parseFloat(textDecoder.decode(event.target.value.buffer));

    // const pressure = event.target.value.getFloat32();
    // console.log("val changed", event.target.value);
    setActualPressure(pressure);
    updateSensorData((sensorData) => {
      const currStartTime = startTime.current;
      const t = Date.now() - currStartTime;
      // console.log("t", t, currStartTime);
      const newDatum = { bars: pressure, t: t };
      const newSensorData =
        t > 50000
          ? timeShiftData(sensorData, newDatum)
          : [...sensorData, newDatum];

      return newSensorData;
    });
  };

  const handleBtDisconnect = () => {
    setComGndBtDevice(undefined);
    setComGndBtService(undefined);
    setComGndBtPressureCharacteristic(undefined);
    setBtConnected(false);
  };

  return (
    <Grommet full theme={theme} themeMode="dark">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {actualPressure}
        
        <Box fill="horizontal">
          <Chart
            liveData={isRunning ? sensorData : {}}
            profileRunnerData={profileData}
            timeDomain={profile.getTotalTime()}
            recipeData={profile.getProfile()}
          />
        </Box>
        <Box direction="row" fill="horizontal" gap="small">
          <ProfileRunner
            profile={profile}
            onStateChange={(state) => {
              setProfileData((profileData) => {
                return [...profileData, state];
              });
              // send the target value to the machine. see: https://web.dev/bluetooth/#write
              if (comGndBtPressureCharacteristic && state.bars) {
                // const encodedPressure = Uint8Array.of(state.bars);
                const textDecoder = new TextDecoder("ascii");
                const encodedPressure = textDecoder.encode(
                  state.bars.toString()
                );
                try {
                  characteristic.writeValue(encodedPressure);
                } catch (error) {
                  console.error("Error writing to bluetooth", error);
                }
              }
            }}
            onStart={() => {
              updateSensorData(() => [{ bars: 0, t: 0 }]);
              setStartTime(Date.now());
              setIsRunning(true);
            }}
            onPause={() => {
              setIsRunning(false);
            }}
            onStop={() => {
              setIsRunning(false);
              updateSensorData(() => [{ bars: 0, t: 0 }]);
              setProfileData(() => [{ bars: 0, t: 0 }]);
            }}
          />
          <Button
            disabled={comGndBtService == undefined}
            onClick={() => {
              updateSensorData(() => [{ bars: 0, t: 0 }]);
              setStartTime(Date.now());
              setIsRunning(true);
            }}
          >
            {isRunning ? "Restart" : "Monitor"}
          </Button>

          <BluetoothConnectButton
            label="Connect"
            onConnect={async (device, server) => {
              try {
                const service = await server.getPrimaryService(0xffe0);
                setComGndBtService(service);
                device.addEventListener(
                  "gattserverdisconnected",
                  handleBtDisconnect
                );
              } catch (error) {
                console.error("Bluetooth error:", error);
              }
            }}
          />
        </Box>
      </main>

      <footer className={styles.footer}>GND-CTRL by COM-GND</footer>
    </Grommet>
  );
}
