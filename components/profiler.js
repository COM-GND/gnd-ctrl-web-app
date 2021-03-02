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

  const [profile, setProfile] = useState(new bloomingEspresso());
  const [profileTotalMs, setProfileTotalMs] = useState(profile.getTotalMs());
  const [profileRecipe, setProfileRecipe] = useState([]);
  const [playState, setPlayState] = useState("stop");
  const [isRunning, setIsRunning] = useState(false);
  const [profileDataHistory, updateProfileDataHistory] = useState([]);
  const [sensorDataHistory, updateSensorDataHistory] = useState([
    { bars: 0, t: 0 },
  ]);

  //   let isBtConnected = useComGndBtIsConnected(comGndBtDevice);
  let [pressure, pressureTimeStamp, setPressure] = useComGndModule(
    comGndBtDevice,
    "pressure"
  );

  // Update the Sensor Data History array when a sensor value changes
  // TODO: This only runs when the sensor value changes, but we want the graph
  // to update a minimal interval anyway. Need to add a timeout event
  useEffect(() => {
    function timeShiftData(data) {
      // return data;
      const allData = [...data].map((datum, i) => {
        return i > 0 ? Object.assign({}, datum, { t: data[i - 1].t }) : datum;
      });
      allData.shift();
      return allData;
    }

    if (pressure) {
      
      const now = Date.now();
      if(startTime === 0) {
        setStartTime(now)
      }
      const t = now - startTime;
      updateSensorDataHistory((history) => {
        let newSensorDataHistory = [...history, { t: t, bars: pressure }];
        if (t > profileTotalMs) {
          newSensorDataHistory = timeShiftData(newSensorDataHistory);
        }
        //filterPressureData(newSensorDataHistory);
        
        return newSensorDataHistory;
      });
    }
  }, [pressure, pressureTimeStamp, profileTotalMs, startTime]);

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
          sensorDataHistory={filterPressureData(sensorDataHistory)}
          profileDataHistory={profileDataHistory}
          timeDomain={profile.getTotalMs()}
          recipeData={profile.getProfile()}
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
