import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Box, Button, Grid, Text, Layer } from "grommet";
import useComGndBtIsConnected from "../hooks/use-com-gnd-bt-is-connected";
import ProfileRunner from "./profile-runner.js";
import bloomingEspresso from "../profiles/blooming-espresso";
import useComGndModule from "../hooks/use-com-gnd-bt-module";
import NodeAddIcon from "../svgs/note_add-24px.svg";
import DeleteIcon from "../svgs/delete-24px.svg";
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

  const isConnected = useComGndBtIsConnected(comGndBtDevice);

  const [showSaveHistory, setShowSaveHistory] = useState(false);

  // pressure is the pressure sensor reading in bars from the com-gnd pressure sensor module hardware
  // value is a float between 0.0 and 10.0 (bars)
  let [pressure, pressureTimeStamp, readPressure, setPressure] = useComGndModule(
    comGndBtDevice,
    "pressureSensor",
    true,
    false, 
    true
  );

  // pressureTarget is the target pressure according to the com-gnd hardware
  // this value can be controlled by this app or external hardware (ie, the rotary encoder module)
  // value is a float between 0.0 and 10.0 (bars)
  let [
    pressureTarget,
    pressureTargetTimeStamp,
    readPressureTarget,
    setPressureTarget,
  ] = useComGndModule(comGndBtDevice, "pressureTarget", false, true, true);

  // The value of the power level set on the com-gnd hardware pump control module
  // value is a float between 0.0 and 1.0
  let [pumpLevel, pumpLevelTimeStamp, readPumpLevel, setPumpLevel] = useComGndModule(
    comGndBtDevice,
    "pumpLevel",
    false,
    false,
    true
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
    if (!(pumpLevel === null || pumpLevel === -1) && pressure) {
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
        ]; /*.filter((datum) => datum.t > t - profileTotalMs)*/
        return newSensorDataHistory;
      });
      lastPressureReadTimeRef.current = t;
    }
  }, [pressure, pressureTimeStamp, pumpLevel, profileTotalMs, startTime]);

  useEffect(() => {
    console.log("Target Pressure Change: ", pressureTarget);
    if (!pressureSliderIsActive) {
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
      className="profiler"
    >
      <Box
        fill="horizontal"
        pad={{ vertical: "none", horizontal: "none" }}
        gridArea="main"
        direction="row"
        className="profiler__main"
        style={{width: 'auto' /* <- prevents a safari bug that causes width to grow forever */}}
      >
        <Chart
          sensorDataHistory={sensorDataHistory}
          profileDataHistory={profileDataHistory}
          timeDomain={profileTotalMs}
          recipeData={profileData}
          pressureTarget={pressureTarget}
        />
        <Box width="28px" pad={{ bottom: "32px", top: "8px"}} direction="row" justify="center">
          <Slider
            disabled={!isConnected && !isRunning}
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
              width: "24px",
              height: "24px",
              marginLeft: "-10px",
            }}
            trackStyle={{
              opacity: "0",
              background: "white",
            }}
            railStyle={{
              opacity: "0",
            }}
          />
          {/* <Range  vertical={true}/> */}
        </Box>
      </Box>
      <Box
        pad={{ top: "none", bottom: "xsmall", horizontal: "medium" }}
        direction="row"
        align="center"
        fill="horizontal"
        gap="small"
        gridArea="controls"
        justify="between"
      >
        <Text size="small">
          {isRunning && startTime > 0 ? (
            new Date(Date.now() - startTime).toLocaleTimeString("en-US", {
              minute: "numeric",
              second: "numeric",
              fractionalSecondDigits: 2,
            })
          ) : (
            <span>00:00.00</span>
          )}
        </Text>
        <ProfileRunner
          profile={profile}
          pumpLevel={pumpLevel}
          disabled={!isConnected}
          onChange={(state) => {
            updateProfileDataHistory((profileDataHistory) => {
              return [...profileDataHistory, state];
            });
            if (state.bars) {
              setPressureTarget(state.bars);
            }
          }}
          onStart={() => {
            setStartTime(0);
            // initialize the target pressure before beginning
            setPressureTarget(profileData[0].bars);
            setIsRunning(true);
            updateSensorDataHistory(() => [{ bars: 0, t: 0 }]);
            updateProfileDataHistory(() => [{ bars: 0, t: 0 }]);
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
            setShowSaveHistory(true);
            onStop();
          }}
        />
      </Box>
      {showSaveHistory &&
      <Layer full="horizontal" modal={false} position="bottom" responsive={false}  style={{minHeight: '24px'}}>
        <Box
          direction="row"
          gap="small"
          fill={true}
          alignContent="center"
          align="center"
          alignSelf="end"
          justify="between"
          pad={{vertical: "xsmall", horizontal:"small"}}
          border={true}
         
        >
          <Box pad={{ horizontal: "medium" }} basis="2/3" flex={false} align="start">
            <Text size="small">Profile complete. Archive data in recipe history? </Text>
          </Box>
          <Box direction="row" basis="1/3" flex={false} justify="end"> 
          <Button
              size="small"
              label="Discard"
              pad="small"
              primary={false}
              icon={
                <DeleteIcon
                  viewBox="0 0 24 24"
                  style={{ fill: "white", width: "20px", height: "20px" }}
                />
              }
              onClick={() => setShowSaveHistory(false)}
            />
            <Button
              size="small"
              pad="small"
              primary={false}
              label="Archive"
              icon={
                <NodeAddIcon
                  viewBox="0 0 24 24"
                  style={{ fill: "white", width: "20px", height: "20px" }}
                />
              }
            />
           
          </Box>
        </Box>
      </Layer>}
    </Grid>
  );
}
