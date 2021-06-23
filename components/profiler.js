import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Box, Button, Grid, Text, Layer, Anchor, Collapsible } from "grommet";
import useComGndBtIsConnected from "../hooks/use-com-gnd-bt-is-connected";
import ProfileRunner from "./profile-runner.js";
import timeAndPressure from "../profiles/time-and-pressure.profiler.js";
import fiveStagePressureProfile from "../profiles/simple-five-stage.config.js";
import useComGndModule from "../hooks/use-com-gnd-bt-module";
import useComGndBtModuleMonitor from "../hooks/use-com-gnd-bt-module-monitor";
import NodeAddIcon from "../svgs/note_add-24px.svg";
import DeleteIcon from "../svgs/delete-24px.svg";
import RecipeEditor from "./recipe-editor";
import Slider, { Range } from "rc-slider";
import Tune from "../svgs/tune-24px.svg";
import "rc-slider/assets/index.css";
import useLocalStorage from "../hooks/use-local-storage";

const Chart = dynamic(() => import("../components/chart"), { ssr: false });
// const timeAndPressureProfile = new timeAndPressure(fiveStagePressureProfile);

const debugBt = true;

export default function Profiler({
  comGndBtDevice,
  recipeId,
  //   liveSensorData,
  onStart = () => {},
  onPause = () => {},
  onStop = () => {},
  onEnd = () => {},
}) {
  const [showNonSsr, setShowNonSsr] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const startTimeRef = useRef(startTime);
  const lastPressureReadTimeRef = useRef();

  // console.log('Profiler for', recipeId);
  // see if custom recipe has been saved to local storage and load it.
  const [storedRecipeData, setStoredRecipeData] = useLocalStorage(
    `${recipeId}:recipe`,
    null
  );
  const [storedHistoryData, setStoredHistoryData] = useLocalStorage(
    `${recipeId}:history:${new Date().toISOString()}`,
    null
  );

  const [profile, _setProfile] = useState();
  const profileRef = useRef(profile);
  const setProfile = (newProfile) => {
    profileRef.current = newProfile;
    _setProfile(newProfile);
  };

  const [profileTotalMs, setProfileTotalMs] = useState();
  const [recipeChartData, setRecipeChartData] = useState();
  const [isRunning, setIsRunning] = useState(false);
  const [profileDataHistory, updateProfileDataHistory] = useState([]);
  const [sensorDataHistory, updateSensorDataHistory] = useState([
    { bars: 0, t: 0 },
  ]);

  const [editorIsOpen, setEditorIsOpen] = useState(false);
  const isConnected = useComGndBtIsConnected(comGndBtDevice);

  const [showSaveHistory, setShowSaveHistory] = useState(false);

  // useEffect(() => {
  //   console.log("profile?", profile);
  //   if(!profile) {
  //     return;
  //   }
  //   setProfileTotalMs(profile.getTotalMs());
  //   setRecipeChartData(profile.getRecipeTimeSeriesData());
  // }, [profile]);

  useEffect(async () => {
    const profileConfigFileName =
      storedRecipeData && storedRecipeData.recipeFile
        ? storedRecipeData.recipeFile
        : "simple-five-stage.config.js";

    console.log("profileConfigFileName", profileConfigFileName);
    const profileConfigData = await import(
      `../profiles/${profileConfigFileName}`
    );
    const data = profileConfigData.default;
    data.configFile = profileConfigFileName;

    console.log("profileConfigData", storedRecipeData, data);
    const profileClass = new timeAndPressure(storedRecipeData || data);
    setProfile(profileClass);
    setProfileTotalMs(profileClass.getTotalMs());
    setRecipeChartData(profileClass.getRecipeTimeSeriesData());
  }, []);

  // pressure is the pressure sensor reading in bars from the com-gnd pressure sensor module hardware
  // value is a float between 0.0 and 10.0 (bars)
  let [pressure, pressureTimeStamp, readPressure, setPressure] =
    useComGndModule(comGndBtDevice, "pressureSensor", true, false, true);

  // pressureTarget is the target pressure according to the com-gnd hardware
  // this value can be controlled by this app or external hardware (ie, the rotary encoder module)
  // value is a float between 0.0 and 10.0 (bars)
  let [
    pressureTarget,
    pressureTargetTimeStamp,
    readPressureTarget,
    setPressureTarget,
  ] = useComGndModule(comGndBtDevice, "pressureTarget", true, true, true);

  // The value of the power level set on the com-gnd hardware pump control module
  // value is a float between 0.0 and 1.0
  let [pumpLevel, pumpLevelTimeStamp, readPumpLevel, setPumpLevel] =
    useComGndModule(comGndBtDevice, "pumpLevel", true, false, true);

  // The value of the boiler external temperature
  // value is a float in Celsius
  // let [
  //   boilerTemperature,
  //   boilerTemperatureTimeStamp,
  //   readBoilerTemperature,
  //   setBoilerTemperature,
  // ] = useComGndModule(comGndBtDevice, "boilerTemperature", true, false, false);
  const boilerTemperature = 10;

  const handleTempChange = (buffer) => {
    console.log("new temp buffer", buffer);
  };

  let [temperatureBuffer, setTemperMonitorState] = useComGndBtModuleMonitor(
    comGndBtDevice,
    "boilerTemperature",
    handleTempChange,
    startTime
  );

  // The value of the pump in-flow rate
  // value is a float in Celsius
  let [flowRate, flowRateTimeStamp, readFlowRate, setFlowRate] =
    useComGndModule(comGndBtDevice, "flowRate", true, false, false);

  // The state value for the manual pressure control slider UI
  // value is an integer between 0 and 1000. It needs to scaled to 0 to 10 to set the pressureTarget
  const [pressureSliderValue, setPressureSliderValue] = useState(
    pressureTarget || 0
  );

  // Track when slide is in active use. We don't want to update the pressureSlideValue
  // with new bluetooth value is the user is actively using the slider.
  const [pressureSliderIsActive, setPressureSliderIsActive] = useState(false);

  // profile.onRecipeChange((recipe, recipeTimeSeriesData) => {
  //   // setRecipeChartData(recipe);
  //   console.log('recipe change', recipeTimeSeriesData);
  //   setRecipeChartData(recipeTimeSeriesData);
  // });

  //console.log('pumpLevel init', pumpLevel);
  const handleRecipeEditorChange = (newRecipeData) => {
    console.log("handleRecipeEditorChange", newRecipeData);
    if (profileRef.current) {
      profileRef.current.setParameters(newRecipeData);
      const newChartData = profileRef.current.getRecipeTimeSeriesData();
      setRecipeChartData(newChartData);
      setProfileTotalMs(profileRef.current.getTotalMs());
    }
  };

  /**
   * Prevent non-ssr components from rendering on server
   */
  useEffect(() => {
    setShowNonSsr(true);
  }, []);

  /* 
  if a recipe is loaded from local storage on initial render, use that data.
  We don't update on any changes to storedRecipeData, since the editor
  already emits onChange events and localStorage is sync. 
  */
  useEffect(() => {
    console.log("loaded saved recipe", storedRecipeData);
    if (storedRecipeData) {
      handleRecipeEditorChange(storedRecipeData);
    }
  }, []);

  // Update the Sensor Data History array when a sensor value changes
  // TODO: This only runs when the sensor value changes, but we want the graph
  // to update a minimal interval anyway. May need to add a timeout event?
  useEffect(async () => {
    // readBoilerTemperature();
    readFlowRate();

    if (debugBt || (!(pumpLevel === null || pumpLevel === -1) && pressure)) {
      const now = Date.now();
      let offset = startTime;
      if (startTime === 0) {
        setTemperMonitorState('start');
        setStartTime(now);
        offset = now;
      }
      // const lastT = lastPressureReadTimeRef.current;
      const t = now - offset;

      updateSensorDataHistory((history) => {
        const newSensorDataHistory = [
          ...history,
          {
            t: t,
            bars: pressure,
            pump: pumpLevel > 0 ? pumpLevel * 10 : 0,
            flow: flowRate > 0 ? (flowRate / 500.0) * 10 : 0,
            c: boilerTemperature / 10,
          },
        ]; /*.filter((datum) => datum.t > t - profileTotalMs)*/
        return newSensorDataHistory;
      });
      lastPressureReadTimeRef.current = t;
    }
  }, [
    pressure,
    pressureTimeStamp,
    pumpLevel,
    boilerTemperature,
    profileTotalMs,
    startTime,
  ]);

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
      areas={[
        ["sidebar", "main"],
        ["controls", "controls"],
      ]}
      rows={["flex", "auto"]}
      columns={["auto"]}
      className="profiler"
    >
      {showNonSsr && (
        <Collapsible direction="horizontal" open={editorIsOpen}>
          <Box
            overflow={{ vertical: "auto" }}
            background={{ dark: "dark-1", light: "light-1" }}
            // gridArea="sidebar"
          >
            <RecipeEditor
              defaultProfileConfig={profile ? profile.getParameters() : {}}
              onChange={handleRecipeEditorChange}
              recipeId={recipeId}
            />
          </Box>
        </Collapsible>
      )}

      <Box
        fill="horizontal"
        pad={{ vertical: "none", horizontal: "none" }}
        gridArea="main"
        direction="row"
        className="profiler__main"
        style={{
          position: "relative",
          width:
            "auto" /* <- prevents a safari bug that causes width to grow forever */,
        }}
      >
        <Box
          justify="between"
          style={{
            position: "absolute",
            top: "-2px",
            left: "8px",
            bottom: "20px",
            fontSize: "12px",
          }}
        >
          <Text color="dark-2" size="xsmall">
            10
          </Text>
          <Text color="dark-2" size="xsmall">
            9
          </Text>
          <Text color="dark-2" size="xsmall">
            8
          </Text>
          <Text color="dark-2" size="xsmall">
            7
          </Text>
          <Text color="dark-2" size="xsmall">
            6
          </Text>
          <Text color="dark-2" size="xsmall">
            5
          </Text>
          <Text color="dark-2" size="xsmall">
            4
          </Text>
          <Text color="dark-2" size="xsmall">
            3
          </Text>
          <Text color="dark-2" size="xsmall">
            2
          </Text>
          <Text color="dark-2" size="xsmall">
            1
          </Text>
          <Text color="dark-2" size="xsmall">
            &nbsp;
          </Text>
        </Box>
        <Chart
          sensorDataHistory={sensorDataHistory}
          profileDataHistory={profileDataHistory}
          temperatureDataHistory={temperatureBuffer}
          timeDomain={profileTotalMs}
          recipeData={recipeChartData}
          pressureTarget={isConnected ? pressureTarget : null}
        />
        <Box
          width="28px"
          pad={{ bottom: "32px", top: "8px" }}
          direction="row"
          justify="center"
          style={{
            position: "absolute",
            right: "10px",
            top: "0",
            bottom: "0",
            zIndex: 10,
          }}
        >
          {isConnected && (
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
                width: "32px",
                height: "32px",
                marginLeft: "-16px",
              }}
              trackStyle={{
                opacity: "0",
                background: "white",
              }}
              railStyle={{
                opacity: "0",
              }}
            />
          )}
          {/* <Range  vertical={true}/> */}
        </Box>
      </Box>
      <Box
        pad={{ top: "none", bottom: "xsmall", left: "none", right: "xsmall" }}
        direction="row"
        align="center"
        fill="horizontal"
        gap="small"
        gridArea="controls"
        justify="between"
      >
        <Box
          flex={false}
          align="start"
          basis="1/3"
          direction="row"
          align="center"
          gap="medium"
        >
          <Button
            onClick={() => setEditorIsOpen(!editorIsOpen)}
            // label={
            //   profileRef.current.getParameters().recipeName || "Edit Recipe"
            // }
            size="small"
            style={{ padding: "8px" }}
            icon={
              <Tune
                viewBox="0 0 24 24"
                style={{ fill: "white", width: "20px", height: "20px" }}
              />
            }
          ></Button>
          {boilerTemperature && <Text size="small">{boilerTemperature}°</Text>}
          {flowRate && <Text size="small">{flowRate}°</Text>}
        </Box>

        <Box flex={false} basis={"1/3"} justify="center">
          <Text size="small" textAlign="center">
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
        </Box>
        <Box flex={false} basis={"1/3"} align="end" pad={{ right: "medium" }}>
          <ProfileRunner
            profileInstance={profileRef.current}
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
              setPressureTarget(recipeChartData[0].bars);
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
      </Box>
      {showSaveHistory && (
        <Layer
          full="horizontal"
          modal={false}
          position="bottom"
          responsive={false}
          style={{ minHeight: "24px" }}
        >
          <Box
            direction="row"
            gap="small"
            fill={true}
            alignContent="center"
            align="center"
            alignSelf="end"
            justify="between"
            pad={{ vertical: "xsmall", horizontal: "small" }}
            border={true}
          >
            <Box
              pad={{ horizontal: "medium" }}
              basis="2/3"
              flex={false}
              align="start"
            >
              <Text size="small">
                Profile complete. Archive data in recipe history?{" "}
              </Text>
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
                onClick={() => {
                  const saveData = {
                    created: new Date().toISOString(),
                    recipeId: recipeId,
                    sensorData: sensorDataHistory,
                    recipeData: recipeChartData,
                  };
                  setStoredHistoryData(saveData);
                  setShowSaveHistory(false);
                }}
              />
            </Box>
          </Box>
        </Layer>
      )}
    </Grid>
  );
}
