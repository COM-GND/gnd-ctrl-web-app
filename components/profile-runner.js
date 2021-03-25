import React, { useState, useRef, useEffect } from "react";
import { Box, Button, Text, Layer } from "grommet";
import PlayIcon from "../svgs/play_arrow-24px.svg";
import StopIcon from "../svgs/stop-24px.svg";
import PauseIcon from "../svgs/pause-24px.svg";

export default function ProfileRunner({
  profile,
  liveData,
  pumpLevel,
  disabled,
  onChange = () => {},
  onStart = () => {},
  onUnpause = () => {},
  onPause = () => {},
  onStop = () => {},
}) {
  const interval = 250; // update frequency in MS

  // const [isWaitingForPump, setIsWaitingForPump] = useState(pumpLevel === 0);
  // console.log('pumpLevel', pumpLevel);
  // const isWaitingForPumpRef = useRef(isWaitingForPump);
  const pumpLevelRef = useRef(pumpLevel);

  const [runState, _setRunState] = useState("stop");
  const runStateRef = useRef(runState);
  const setRunState = (state) => {
    runStateRef.current = state;
    _setRunState(state);
  };

  // timer keeps the absolute time.
  const [timer, _setTimer] = useState(null);
  const timerRef = useRef(timer);
  const setTimer = (time) => {
    timerRef.current = time;
    _setTimer(time);
  };

  // runTime keeps the relative run-time of the profile.
  const [runTime, _setRunTime] = useState(0);
  const runTimeRef = useRef(runTime);
  const setRunTime = (time) => {
    runTimeRef.current = time;
    _setRunTime(time);
  };

  // keeps the offset time of when the run was started
  // const [startTime, _setStartTime] = useState(null);
  // const startTimeRef = useRef(startTime);

  // const setStartTime = (time) => {
  //   startTimeRef.current = time;
  //   _setStartTime(time);
  // };

  // const getRunningTime = () => {
  //   if (runTime.current && timerRef.current) {
  //     const time = startTimeRef.current
  //       ? timerRef.current - startTimeRef.current
  //       : 0;
  //     return time > 0 ? time : 0;
  //   }
  //   return 0;
  // };

  const handleTick = () => {
    const tickLength = Date.now() - timerRef.current;
    setTimer(timerRef.current + tickLength);
    // console.log(
    //   "runStateRef",
    //   runStateRef.current,
    //   "pumpLevelRef.current",
    //   pumpLevelRef.current
    // );
    if (
      runStateRef.current === "play" &&
      pumpLevelRef.current !== null &&
      pumpLevelRef.current !== 0
    ) {
      setRunTime(runTimeRef.current + tickLength);
      if (runTimeRef.current < profile.getTotalMs()) {
        const state = profile.getStateAtTime(runTimeRef.current);
        console.log("state", state);
        onChange(state);
      } else {
        // setRunState("stop");
        // onStop();
      }
    } else if (
      runTimeRef.current > 0 &&
      (runStateRef.current === "play" || runStateRef.current === "pause") &&
       pumpLevelRef.current === 0
    ) {
      // if the pump power is turned off while in play state, switch to stop state
      setRunState("stop");
      setRunTime(0);
      onStop();
    }
  };

  useEffect(() => {
    const callbackId = window.setInterval(handleTick, interval);
    return () => {
      console.log("clearInterval");
      clearInterval(callbackId);
    };
  }, []);

  useEffect(() => {
    pumpLevelRef.current = pumpLevel;
  }, [pumpLevel]);

  return (
    <Box direction="row" gap="xxsmall">
      {/* <Text>{runState ? getRunningTime() / 1000 : 0}</Text> */}

      {(pumpLevel == null || pumpLevel == 0) && runTime == 0 && runState === "play" && (
        <Layer modal={false} background="transparent" responsive={false}>
          <Box border={false} pad="medium" background={{opacity: .8, color: "dark-1"}}>
            <Text>Power on machine to start.</Text>
          </Box>
        </Layer>
      )}
      <Button
        hoverIndicator={{
          color: "white",
          opacity: 0.1,
        }}
        disabled={disabled}
        margin="none"
        size="small"
        onClick={() => {
          if (runState === "play") {
            setRunState("pause");
            onPause();
          } else if (runState === "pause") {
            setRunState("play");
            onUnpause();
          } else {
            // setRunTime(0);
            setRunState("play");
            setRunTime(0);
            onStart();
          }
        }}
        icon={
          runState === "play" ? (
            <PauseIcon
              viewBox="0 0 24 24"
              style={{ fill: "white", width: "16px", height: "16px" }}
            />
          ) : (
            <PlayIcon
              viewBox="0 0 24 24"
              style={{ fill: "white", width: "16px", height: "16px" }}
            />
          )
        }
      />
      <Button
        disabled={runState === "stop" || disabled}
        onClick={() => {
          setRunState("stop");
          setRunTime(0);
          onStop();
        }}
        icon={
          <StopIcon
            viewBox="0 0 24 24"
            style={{ fill: "white", width: "16px", height: "16px" }}
          />
        }
      />
    </Box>
  );
}
