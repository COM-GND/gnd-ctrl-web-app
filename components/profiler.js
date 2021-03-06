import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Box, Button, Grid } from "grommet";
import useComGndBtIsConnected from "../hooks/use-com-gnd-bt-is-connected";
import ProfileRunner from "./profile-runner.js";
import bloomingEspresso from "../profiles/blooming-espresso";
import useComGndModule from "../hooks/use-com-gnd-bt-module";
import filterPressureData from "../utils/filter-pressure-data";

const Chart = dynamic(() => import("../components/chart"), { ssr: false });

export default function Profiler({
  comGndBtDevice,
  //   liveSensorData,
  onStart = () => {},
  onPause = () => {},
  onStop = () => {},
  onEnd = () => {},
}) {
  const [startTime, setStartTime] = useState(0);
  const startTimeRef = useRef(startTime);
  const lastPressureReadTimeRef = useRef();

  const [profile, setProfile] = useState(new bloomingEspresso());
  const [profileTotalMs, setProfileTotalMs] = useState(profile.getTotalMs());
  const [profileRecipe, setProfileRecipe] = useState(profile.getDefaultRecipe());
  const [playState, setPlayState] = useState("stop");
  const [isRunning, setIsRunning] = useState(false);
  const [profileDataHistory, updateProfileDataHistory] = useState([]);
  const [sensorDataHistory, updateSensorDataHistory] = useState([
    { bars: 0, t: 0 },
  ]);

  //   let isBtConnected = useComGndBtIsConnected(comGndBtDevice);
  let [pressure, pressureTimeStamp, setPressure] = useComGndModule(
    comGndBtDevice,
    "pressureSensor"
  );
  let [pressureTarget, pressureTargetTimeStamp, setPressureTarget] = useComGndModule(
    comGndBtDevice,
    "pressureTarget"
  );

  const profileData = profile.getProfile();
  // Update the Sensor Data History array when a sensor value changes
  // TODO: This only runs when the sensor value changes, but we want the graph
  // to update a minimal interval anyway. Need to add a timeout event
  useEffect(() => {
    function timeShiftData(data, lastTime) {
      // shift the time off the data so that it the data stays within the profile time length
      // any value that go below zero are remove. 

      if(data.length < 2) {
        return data;
      }
      const timeDelta = data[data.length - 1].t - lastTime;
      // let lastNegativeIndex = data.slice().reverse().findIndex(j => j.t - timeDelta < 0);
      // lastNegativeIndex == lastNegativeIndex < 0 ? 0 : lastNegativeIndex;
      // lastNegativeIndex = lastNegativeIndex !== -1 ? data.length - 1 - lastNegativeIndex : -1;

      const allData = [...data].map((datum, i, data) => {
        let newT = datum.t - timeDelta
        // We need to keep the last negative value and change it t0 to preserve full line length
        return Object.assign({}, datum, { t: newT});
      }).filter((datum, i) => datum.t >= 0);

      console.log(lastTime, timeDelta, data);
      return allData;
    }
    
    if (pressure) {
      
      const now = Date.now();
      let offset = startTime;
      if(startTime === 0) {
        setStartTime(now)
        offset = now;
      }
      const lastT = lastPressureReadTimeRef.current;
      const t = now - offset;

      updateSensorDataHistory((history) => {
        const newSensorDataHistory = [...history, { t: t, bars: pressure }].filter(datum => datum.t > t - profileTotalMs);
        return newSensorDataHistory;
      });
      lastPressureReadTimeRef.current = t;
    }
  }, [pressure, pressureTimeStamp, profileTotalMs, startTime]);

  useEffect(() => {
    console.log('Target Pressure Change: ', pressureTarget);
  }, [pressureTarget]);

  return (
    <Grid
      direction="column"
      fill={true}
      border={true}
      areas={[["main"], ["controls"]]}
      rows={["flex", "auto"]}
      columns={["auto"]}
    >
      <Box fill="horizontal" pad="small" gridArea="main">
        <Chart
          sensorDataHistory={sensorDataHistory}
          profileDataHistory={profileDataHistory}
          timeDomain={profileTotalMs}
          recipeData={profileData}
          pressureTarget={pressureTarget}
        />
      </Box>
      <Box pad={{top: "none", horizontal: "small"}} gridArea="controls">
        <ProfileRunner
          profile={profile}
          onChange={(state) => {
            updateProfileDataHistory((profileDataHistory) => {
              return [...profileDataHistory, state];
            });
            if (state.bars) {
              setPressure(state.bars);
            }

            // send the target value to the machine. see: https://web.dev/bluetooth/#write
            //   if (comGndBtPressureCharacteristic && state.bars) {
            //     // const encodedPressure = Uint8Array.of(state.bars);
            //     const textDecoder = new TextDecoder("ascii");
            //     const encodedPressure = textDecoder.encode(state.bars.toString());
            //     try {
            //       characteristic.writeValue(encodedPressure);
            //     } catch (error) {
            //       console.error("Error writing to bluetooth", error);
            //     }
            //   }
          }}
          onStart={() => {
            //updateSensorDataHistory([{ bars: 0, t: 0 }]);
            setStartTime(Date.now());
            setIsRunning(true);
            onStart();
          }}
          onPause={() => {
            setIsRunning(false);
            onPause();
          }}
          onUnPause={() => {
            setIsRunning(true);
          }}
          onStop={() => {
            setIsRunning(false);
            setStartTime(Date.now());
            updateSensorDataHistory(() => [{ bars: 0, t: 0 }]);
            updateProfileDataHistory(() => [{ bars: 0, t: 0 }]);
            onStop();
          }}
        />
      </Box>
    </Grid>
  );
}
