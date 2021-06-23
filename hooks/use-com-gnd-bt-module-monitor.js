import { useEffect, useRef, useState } from "react";
import useComGndBtModule from "./use-com-gnd-bt-module";

/**
 * Read a sensor value at a set interval
 * @param {int} interval time between readings
 */
export default function useComGndBtModuleMonitor(
  btDevice,
  sensorName,
  onChange = () => {},
  startTime = 0,
  interval = 250
) {
  const [value, timeStamp, readValue, setValue] = useComGndBtModule(
    btDevice,
    sensorName,
    true,
    false,
    false
  );

  const [isActive, setIsActive] = useState(false);
  const buffer = useRef([]);

  const readValueRef = useRef(readValue);

  useEffect(() => {
    const handleTick = async () => {
      const result = await readValueRef.current();
    };

    let callbackId = false;

    if(isActive) {
      callbackId = window.setInterval(handleTick, interval);
    } else if(callbackId) {
      clearInterval(callbackId);
    }
    
    return () => {
      console.log("clearInterval");
      clearInterval(callbackId);
    };
  }, [isActive]);

  useEffect(() => {
    readValueRef.current = readValue;
  }, [readValue]);

  useEffect(() => {
    if (value !== null && timeStamp !== null) {
      const lastTime =
        buffer.current.length > 1
          ? buffer.current[buffer.current.length - 1].t
          : 0;
      const currTime = timeStamp - startTime;
      if(lastTime !== currTime ) {
        buffer.current.push({ value: value / 10.0, t: currTime });
        onChange(buffer);  
      }
    }
  }, [value, timeStamp, onChange, startTime]);

  const setMonitorState = (monitorState) => {
    if(monitorState === 'start') {
      setIsActive(true);
    } else if (monitorState === 'stop') {
      setIsActive(false);
    }
  }
  return [buffer.current, setMonitorState];
}
