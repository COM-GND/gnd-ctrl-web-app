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
  interval = 250
) {
  const [value, timeStamp, readValue, setValue] = useComGndBtModule(
    btDevice,
    sensorName,
    true,
    false,
    false
  );

  const readValueRef = useRef(readValue);

  useEffect(() => {
    const handleTick = async () => {
      const result = await readValueRef.current();
    };

    let callbackId = window.setInterval(handleTick, interval);

    return () => {
      console.log("clearInterval");
      clearInterval(callbackId);
    };
  }, []);

  useEffect(() => {
    readValueRef.current = readValue;
  }, [readValue]);

  useEffect(() => {
    if(value) {
      onChange(value);
    } else {
      onChange(null);
    }
  }, [value]);

}
