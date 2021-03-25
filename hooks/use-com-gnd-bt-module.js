import { useState, useEffect, useRef } from "react";
import comGndConfig from "../device-configs/com-gnd-default-config";
import useComGndIsConnected from "./use-com-gnd-bt-is-connected";
import useDebouncedEffect from "./use-debounced-effect";

export default function useComGndModule(btDevice, sensorName) {
  const isConnected = useComGndIsConnected(btDevice);

  const [comGndBtService, setComGndBtService] = useState();
  const [btCharacteristic, setBtCharacteristic] = useState();
  const [notificationsStarted, setNotificationsStarted] = useState();
  const [sensorValue, setSensorValue] = useState(null);
  const [timeStamp, setTimeStamp] = useState(null);

  const [targetValue, setTargetValue] = useState();
  const targetValueRef = useRef(targetValue);
  const [targetValueTimeStamp, setTargetValueTimestamp] = useState();

  const gattWriteIsInProgress = useRef(false);
  const gattWriteTimeoutRef = useRef();

  const serviceId = comGndConfig.bluetooth.serviceId;
  const characteristics = comGndConfig.bluetooth.characteristics;

  const setValue = (targetValue) => {
    setTargetValue(targetValue);
    setTargetValueTimestamp(Date.now());
  };

  useDebouncedEffect(
    async () => {
      // the characteristic writeValue may already be in progress from previsou writeValue
      // Here we use an async function to qeueu the write value if the previous write hasn't finished.
      // TODO - this only ensures that the most recent value is sent - do we want to ensure ALL values are sent? 
      async function writeValue() {
        const textEncoder = new TextEncoder();
        //const encodedValue = textEncoder.encode(targetValueRef.current);
        if (gattWriteTimeoutRef.current) {
          clearTimeout(gattWriteTimeoutRef.current);
          // console.log('co', gattWriteTimeoutRef.current );
          gattWriteTimeoutRef.current = undefined;
        }
        try {
          if (!gattWriteIsInProgress.current) {
            // if (targetValue !== targetValueRef.current) {
            gattWriteIsInProgress.current = true;
            console.log(
              "write bt characteristic value",
              btCharacteristic,
              targetValue
            );
            
            const encodedValue = textEncoder.encode(targetValueRef.current);
            await btCharacteristic.writeValue(encodedValue);

            // clear after settings
            gattWriteIsInProgress.current = false;
            //setTargetValue(undefined);
            // }
          } else {
            if (!gattWriteTimeoutRef.current) {
              gattWriteTimeoutRef.current = window.setTimeout(writeValue, 5);
              // console.log('to', gattWriteTimeoutRef.current);
            }
          }
        } catch (error) {
          console.error("Bluetooth error: ", error);
        }
      }

      if (isConnected && btCharacteristic && targetValue) {
        // TODO - encoding might be different if value is not a float.
        targetValueRef.current = targetValue;
        writeValue();
      }

      return () => {
        clearTimeout(gattWriteTimeoutRef.current);
      };
    },
    1,
    [isConnected, btCharacteristic, targetValue]
  );

  /**
   * Handle outgoing updates to target value and send to bt device.
   */
  // useEffect(async () => {
  //   let timeoutID = undefined;

  //   // the characteristic writeValue may already be in progress from previsou writeValue
  //   // Here we use an async function to qeueu the write value if the previous write hasn't finished.
  //   async function writeValue() {
  //     const textEncoder = new TextEncoder();
  //     const encodedValue = textEncoder.encode(targetValueRef.current);
  //     if (gattWriteTimeoutRef.current) {
  //       clearTimeout(timeoutID);
  //       // console.log('co', gattWriteTimeoutRef.current );
  //       gattWriteTimeoutRef.current = undefined;
  //     }
  //     try {
  //       if (!gattWriteIsInProgress.current) {
  //         // if (targetValue !== targetValueRef.current) {
  //           gattWriteIsInProgress.current = true;
  //           console.log(
  //             "write bt characteristic value",
  //             btCharacteristic,
  //             targetValue
  //           );
  //           await btCharacteristic.writeValue(encodedValue);

  //           // clear after settings
  //           gattWriteIsInProgress.current = false;
  //           //setTargetValue(undefined);
  //         // }
  //       } else {
  //         if(!gattWriteTimeoutRef.current) {
  //           gattWriteTimeoutRef.current = window.setTimeout(writeValue, 20);
  //           // console.log('to', gattWriteTimeoutRef.current);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Bluetooth error: ", error);
  //     }
  //   }

  //   if (isConnected && btCharacteristic && targetValue) {
  //     // TODO - encoding might be different if value is not a float.
  //     targetValueRef.current = targetValue;
  //     writeValue();
  //   }

  //   return () => {
  //     clearTimeout(gattWriteTimeoutRef.current);
  //   };
  // }, [isConnected, btCharacteristic, targetValue]);

  /**
   * Handle incoming changes to sensor value
   */
  useDebouncedEffect(async () => {
    function handleCharacteristicValueChanged(event) {
      let value;
      //console.log("update:", event.target.value.buffer);

      if (characteristics[sensorName].type === "float") {
        // decode float value
        // const textDecoder = new TextDecoder("ascii");
        // value = parseFloat(textDecoder.decode(event.target.value.buffer));
        value = new Float32Array(event.target.value.buffer)[0];
        if(!value) {
          console.error('use-com-gnd-bt-module error at handleCharacteristicValueChanged:', value);
          value = 0;
        } else {
           // round to 2 deciman places
          value = Math.round(value * 100) / 100;
        }
      } else {
        value = event.target.value.buffer;
        // console.log("update:", event.target.value.buffer);
      }

      const timeStamp = Date.now();

      setSensorValue(value);
      setTimeStamp(timeStamp);
      // console.log("value changed", value, timeStamp);
    }

    if (isConnected) {
      try {
        const comGndBtServer = btDevice.gatt;

        if (!comGndBtService) {
          const service = await comGndBtServer.getPrimaryService(serviceId);
          setComGndBtService(service);
        }
        // const comGndBtService = await comGndBtServer.getPrimaryService(serviceId);

        if (comGndBtService && !btCharacteristic) {
          console.log("getCharacteristic", characteristics[sensorName].id);
          const characteristic = await comGndBtService.getCharacteristic(
            characteristics[sensorName].id
          );
          if (characteristic) {
            setBtCharacteristic(characteristic);
            if (!notificationsStarted) {
              console.log("startNotifications", sensorName);
              try {
                await characteristic.startNotifications();
              } catch (err) {
                console.error(
                  "Bluetooth error (startNotifications): ",
                  sensorName,
                  err,
                  characteristic.properties
                );
              }
              setNotificationsStarted(true);
            }
            console.log("add characteristicvaluechanged", sensorName);
            try {
              characteristic.addEventListener(
                "characteristicvaluechanged",
                handleCharacteristicValueChanged
              );
            } catch (err) {
              console.error(
                "Bluetooth error (addEventListener characteristicvaluechanged): ",
                sensorName,
                err
              );
            }
            setBtCharacteristic(characteristic);
          }
        }
      } catch (error) {
        console.error("Bluetooth Error", error);
      }

      //   if (btCharacteristic) {
      //     if (!notificationsStarted) {
      //       console.log("startNotifications");
      //       btCharacteristic.startNotifications();
      //       setNotificationsStarted(true);
      //     }
      //     console.log("add characteristicvaluechanged");
      //     btCharacteristic.addEventListener(
      //       "characteristicvaluechanged",
      //       handleCharacteristicValueChanged
      //     );
      //   }
    } else {
      setComGndBtService(null);
      setBtCharacteristic(null);
      setNotificationsStarted(false);
    }
    return () => {
      //if (btCharacteristic) {
      console.log("remove characteristicvaluechanged");
      btCharacteristic.removeEventListener(
        "characteristicvaluechanged",
        handleCharacteristicValueChanged
      );
      //}
    };
  }, 50, [isConnected, comGndBtService, btCharacteristic, notificationsStarted]);

  //   console.log("value changed", sensorValue, timeStamp);
  return [sensorValue, timeStamp, setValue];
}
