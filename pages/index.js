import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import gndCtrlTheme from "../styles/gnd-ctrl-standard-theme.js";
import {
  Grommet,
  Main,
  Grid,
  Box,
  Button,
  grommet,
  Layer,
  Text,
  Anchor,
  Heading,
} from "grommet";
import { deepMerge } from "grommet/utils";
import BluetoothConnectButton from "../components/bluetooth-connect-button";
import useComGndBtIsConnected from "../hooks/use-com-gnd-bt-is-connected";
import Profiler from "../components/profiler";
import ProfileBrowser from "../components/profile-browser";
import Header from "../components/header";
import requestWakeLock from "../utils/wake-lock";
import comGndConfig from "../device-configs/com-gnd-default-config";

const theme = deepMerge(grommet, gndCtrlTheme);

// https://googlechrome.github.io/samples/web-bluetooth/discover-services-and-characteristics.html

// console.log('conect', navigator.bluetooth);

export default function Home() {
  // const [startTime, _setStartTime] = useState(Date.now());
  const startTime = useRef(Date.now());
  const setStartTime = (time) => {
    startTime.current = time;
  };

  const [isRunning, setIsRunning] = useState(false);
  const [sensorData, updateSensorData] = useState([{ bars: 0, t: 0 }]);
  const [comGndBtDevice, setComGndBtDevice] = useState();
  const [comGndBtService, setComGndBtService] = useState();
  const [
    comGndBtPressureCharacteristic,
    setComGndBtPressureCharacteristic,
  ] = useState();

  const isBtConnected = useComGndBtIsConnected(comGndBtDevice);
  const [errorMessage, setErrorMessage] = useState();

  const [view, setView] = useState("profileBrowser");

  const handleBtDisconnect = () => {
    setComGndBtDevice(undefined);
    setComGndBtService(undefined);
    setComGndBtPressureCharacteristic(undefined);
  };

  return (
    <Grommet full theme={theme} themeMode="dark">
      <Head>
        <title>GND-CTRL</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover"
        ></meta>
      </Head>

      <Grid
        fill
        rows={["auto", "flex", "auto", "auto"]}
        columns={["full"]}
        areas={[["header"], ["main"], ["controls"], ["footer"]]}
        className="app-container"
      >
        <Header>
          <BluetoothConnectButton
            label="Connect"
            onConnect={async (device, server) => {
              try {
                setComGndBtDevice(device);
                const service = await server.getPrimaryService(
                  comGndConfig.bluetooth.serviceId
                );
                setComGndBtService(service);
                device.addEventListener(
                  "gattserverdisconnected",
                  handleBtDisconnect
                );
              } catch (error) {
                console.error("Bluetooth error:", error);
              }
              requestWakeLock(1);
            }}
            onError={(error) => {
              if (error.name === "NotFoundError") {
                setErrorMessage(
                  <Box>
                    <Heading
                      level={3}
                      size="small"
                      margin={{ bottom: "small", top: "none" }}
                    >
                      This browser does not support Bluetooth ({error.message})
                    </Heading>
                    <Text size="small">
                      Please check{" "}
                      <Anchor
                        href="https://caniuse.com/web-bluetooth"
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        caniuse.com/web-bluetooth
                      </Anchor>{" "}
                      to find a supported browser.
                    </Text>
                  </Box>
                );
              }
            }}
          />
        </Header>
        {errorMessage && (
          <Layer modal={false} background="transparent" responsive={false}>
            <Box
              border={false}
              pad="medium"
              background={{ opacity: 0.8, color: "dark-1" }}
            >
              <Text>{errorMessage}</Text>
            </Box>
          </Layer>
        )}
        <Box fill={true} border={false} gridArea="main" overflow="hidden">
          {view === "profileBrowser" ? (
            <ProfileBrowser />
          ) : (
            <Profiler comGndBtDevice={comGndBtDevice} />
          )}
        </Box>
        <Box
          gridArea="controls"
          direction="row"
          fill="horizontal"
          gap="small"
        ></Box>
        <Box gridArea="footer" border={false}></Box>
      </Grid>
    </Grommet>
  );
}
