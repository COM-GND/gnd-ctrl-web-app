import React, { useState, useRef, useEffect } from "react";
import {Box, Button, Text} from 'grommet';

export default function ProfileRunner({
  profile,
  liveData,
  onStateChange = () => {},
  onStart = () => {},
  onPause = () => {},
  onStop = () => {},
}) {
  const interval = 250; // update frequency in MS

  const [isRunning, _setIsRunning] = useState(false);
  const isRunningRef = useRef(isRunning);
  const setIsRunning = (flag) => {
    isRunningRef.current = flag;
    _setIsRunning(flag);
  };
  const [timer, _setTimer] = useState(0);
  const timerRef = useRef(timer);

  const [startTime, _setStartTime] = useState(Date.now());
  const startTimeRef = useRef(startTime);

  const setTimer = (time) => {
    timerRef.current = time;
    _setTimer(time);
  };

  const setStartTime = (timer) => {
    startTimeRef.current = timer;
    _setStartTime(timer);
  };

  const getRunningTime = () => {
    const time = timerRef.current - startTimeRef.current;
    return time > 0 ? time : 0;
  };

  const handleTick = () => {
    setTimer(Date.now());
    if (isRunningRef.current) {
      const runningTime = getRunningTime();
      if(runningTime < profile.getTotalTime()){
        const state = profile.getStateAtTime(runningTime);
        onStateChange(state);
      } else if(isRunningRef.current) {
        setIsRunning(false);
        // onPause();
      }
     
    }
  };

  useEffect(() => {
    const callbackId = window.setInterval(handleTick, interval);
    return () => {
      console.log('clearInterval');
      clearInterval(callbackId);
    };
  }, []);

  return (
    <Box direction="horizontal" gap="small">
      <Text>{isRunning ? getRunningTime() / 1000 : 0}</Text>
      <Button
        onClick={() => {
          setStartTime(timer);
          if (!isRunning) {
            onStart();
          } else {
            onPause();
          }
          setIsRunning(!isRunning);
        }}
      >
        {isRunning ? "Pause" : "Start"}
      </Button>
      <Button
        onClick={() => {
          setIsRunning(false);
          onStop();
        }}
      >
        Stop
      </Button>
    </Box>
  );
}
