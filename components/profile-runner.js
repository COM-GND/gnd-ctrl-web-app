import React, { useState, useRef, useEffect } from "react";

export default function ProfileRunner({
  profile,
  liveData,
  onStateChange = () => {},
}) {
  const interval = 500; // update frequency in MS

  const [isRunning, _setIsRunning] = useState(false);
  const isRunningRef = useRef(isRunning);
  const setIsRunning = (flag) => {
    isRunningRef.current = flag;
    _setIsRunning(flag);
  }
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
      const state = profile.getStateAtTime(getRunningTime());
      onStateChange(state);
    }
  };

  useEffect(() => {
    const callbackId = window.setInterval(handleTick, interval);
    return () => {
      clearTimeout(callbackId);
    };
  }, [profile]);

  return (
    <div>
      {isRunning ? getRunningTime() / 1000 : 0}
      <button
        onClick={() => {
          setStartTime(timer);
          setIsRunning(!isRunning);
          
        }}
      >
        {isRunning ? "Pause" : "Start"}
      </button>
    </div>
  );
}
