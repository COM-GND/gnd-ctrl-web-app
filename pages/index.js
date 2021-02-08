import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import styles from "../styles/Home.module.css";

import BluetoothConnectButton from "../components/bluetooth-connect-button";
const Chart = dynamic(() => import("../components/chart"), { ssr: false });

// https://googlechrome.github.io/samples/web-bluetooth/discover-services-and-characteristics.html

// console.log('conect', navigator.bluetooth);

export default function Home() {
  const PRESSURE_ID = 0xffe1;

  const [startTime, setStartTime] = useState(Date.now());
  const [pressureData, setPressureData] = useState([{ bars: 0, t: 0 }]);

  const [actualPressure, setActualPressure] = useState(0);
  const [comGndBtDevice, setComGndBtDevice] = useState();
  const [comGndBtService, setComGndBtService] = useState();
  const [
    comGndBtPressureCharacteristic,
    setComGndBtPressureCharacteristic,
  ] = useState();

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

  const handleCharacteristicValueChanged = (event) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTCharacteristic/readValue
    // readValue returns a promise for a DataView object
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
    // arduino stores floats as 32bit
    const textDecoder = new TextDecoder("ascii");
    const pressure = textDecoder.decode(event.target.value.buffer);

    // const pressure = event.target.value.getFloat32();
    console.log("val changed", event.target.value);
    setActualPressure(pressure);
    setPressureData((pressureData) => {
      const t = Date.now() - startTime;
      const newPressureData = [...pressureData, { bars: pressure, t: t }];
      if (newPressureData.length > 25) {
        newPressureData.shift();
      }
      return newPressureData;
    });
  };

  const handleBtDisconnect = () => {
    setComGndBtDevice(undefined);
    setComGndBtService(undefined);
    setComGndBtPressureCharacteristic(undefined);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {actualPressure}
        <Chart liveData={pressureData} />

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
      </main>

      <footer className={styles.footer}>GND-CTRL by COM-GND</footer>
    </div>
  );
}
