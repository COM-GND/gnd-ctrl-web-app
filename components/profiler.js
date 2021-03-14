import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Box, Button, Grid } from "grommet";
import useComGndBtIsConnected from "../hooks/use-com-gnd-bt-is-connected";
import ProfileRunner from "./profile-runner.js";
import bloomingEspresso from "../profiles/blooming-espresso";
import useComGndModule from "../hooks/use-com-gnd-bt-module";
import Slider, { Range } from "rc-slider";
import "rc-slider/assets/index.css";

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
  const [profileRecipe, setProfileRecipe] = useState(
    profile.getDefaultRecipe()
  );
  const [playState, setPlayState] = useState("stop");
  const [isRunning, setIsRunning] = useState(false);
  const [profileDataHistory, updateProfileDataHistory] = useState([]);
  const [sensorDataHistory, updateSensorDataHistory] = useState([
    { bars: 0, t: 0 },
  ]);

  // pressure is the pressure sensor reading in bars from the com-gnd pressure sensor module hardware
  // value is a float between 0.0 and 10.0 (bars)
  let [pressure, pressureTimeStamp, setPressure] = useComGndModule(
    comGndBtDevice,
    "pressureSensor"
  );

  // pressureTarget is the target pressure according to the com-gnd hardware
  // this value can be controlled by this app or external hardware (ie, the rotary encoder module)
  // value is a float between 0.0 and 10.0 (bars)
  let [
    pressureTarget,
    pressureTargetTimeStamp,
    setPressureTarget,
  ] = useComGndModule(comGndBtDevice, "pressureTarget");

  // The value of the power level set on the com-gnd hardware pump control module
  // value is a float between 0.0 and 1.0
  let [pumpLevel, pumpLevelTimeStamp] = useComGndModule(
    comGndBtDevice,
    "pumpLevel"
  );

  // the state value for the manual pressure control slider UI
  // value is an integer between 0 and 1000. It needs to scaled to 0 to 10 to set the pressureTarget
  const [pressureSliderValue, setPressureSliderValue] = useState(
    pressureTarget || 0
  );

  // Track when slide is in active use. We don't want to update the pressureSlideValue 
  // with new bluetooth value is the user is actively using the slider. 
  const [pressureSliderIsActive, setPressureSliderIsActive] = useState(false);

  //console.log('pumpLevel init', pumpLevel);

  const profileData = profile.getProfile();
  // Update the Sensor Data History array when a sensor value changes
  // TODO: This only runs when the sensor value changes, but we want the graph
  // to update a minimal interval anyway. May need to add a timeout event?
  useEffect(() => {
    if (/*pumpLevel &&*/ pressure) {
      const now = Date.now();
      let offset = startTime;
      if (startTime === 0) {
        setStartTime(now);
        offset = now;
      }
      // const lastT = lastPressureReadTimeRef.current;
      const t = now - offset;

      updateSensorDataHistory((history) => {
        const newSensorDataHistory = [
          ...history,
          { t: t, bars: pressure },
        ].filter((datum) => datum.t > t - profileTotalMs);
        return newSensorDataHistory;
      });
      lastPressureReadTimeRef.current = t;
    }
  }, [pressure, pressureTimeStamp, pumpLevel, profileTotalMs, startTime]);

  useEffect(() => {
    console.log("Target Pressure Change: ", pressureTarget);
    if(!pressureSliderIsActive){
      setPressureSliderValue(pressureTarget * 100);
    } 
  }, [pressureTarget, pressureSliderIsActive]);

  useEffect(() => {
    console.log("Pump Level Change: ", pumpLevel);
  }, [pumpLevel]);

  return (
    <Grid
      direction="column"
      fill={true}
      border={false}
      areas={[["main"], ["controls"]]}
      rows={["flex", "auto"]}
      columns={["auto"]}
    >
      <Box
        fill="horizontal"
        pad={{ vertical: "none", horizontal: "small" }}
        gridArea="main"
        direction="row"
      >
        <Chart
          sensorDataHistory={sensorDataHistory}
          profileDataHistory={profileDataHistory}
          timeDomain={profileTotalMs}
          recipeData={profileData}
          pressureTarget={pressureTarget}
        />
        <Box pad={{ bottom: "36px", top: "4px" }}>
          <Slider
            vertical={true}
            min={0}
            max={1000}
            defaultValue={pressureTarget * 100}
            value={pressureSliderValue}
            onBeforeChange={() => setPressureSliderIsActive(true)}
            onChange={(val) => {
              setPressureSliderValue(val);
              setPressureTarget(val / 100);
            }}
            onAfterChange={() => setPressureSliderIsActive(false)}
            handleStyle={{
              border: "none",
              opacity: ".3",
              width: '20px',
              height: '20px',
              marginLeft: "-8px"
            }}
            trackStyle={{
              opacity: ".1",
              background: "white" 
            }}
            railStyle={{
              opacity: ".1",
            }}
          />
          {/* <Range  vertical={true}/> */}
        </Box>
      </Box>
      <Box pad={{ top: "none", horizontal: "small" }} gridArea="controls">
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
