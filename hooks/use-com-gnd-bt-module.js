import { useState, useEffect, useRef } from "react";
import useComGndIsConnected from "./use-com-gnd-bt-is-connected";

export default function useComGndModule(btDevice, sensorName) {
  const isConnected = useComGndIsConnected(btDevice);

  const [comGndBtService, setComGndBtService] = useState();
  const [btCharacteristic, setBtCharacteristic] = useState();
  const [notificationsStarted, setNotificationsStarted] = useState();
  const [sensorValue, setSensorValue] = useState(null);
  const [timeStamp, setTimeStamp] = useState(null);

  const [targetValue, setTargetValue] = useState();
  const [targetValueTimeStamp, setTargetValueTimestamp] = useState();

  const serviceId = "8fc1ceca-b162-4401-9607-c8ac21383e4e";
  const characteristics = {
    pressure: {
      id: "c14f18ef-4797-439e-a54f-498ba680291d",
      type: "float",
    },
  };

  const setValue = (targetValue) => {
    setTargetValue(targetValue);
    setTargetValueTimestamp(Date.now());
  };

  /**
   * Handle outgoing updates to target value and send to bt device.
   */
  useEffect(async () => {
    if (isConnected && btCharacteristic && targetValue) {
      // TODO - encoding might be different if value is not a float.
      const textEncoder = new TextEncoder();
      const encodedValue = textEncoder.encode(targetValue);

      try {
        console.log("set pressure", targetValue);
        await btCharacteristic.writeValue(encodedValue);
        // clear after settings
        setTargetValue(undefined);
      } catch (error) {
        console.error("Bluetooth error: ", error);
      }
    }
  }, [isConnected, btCharacteristic, targetValue]);

  /**
   * Handle incoming changes to sensor value
   */
  useEffect(async () => {
    function handleCharacteristicValueChanged(event) {
      let value;
      // console.log("update:", event.target.value.buffer);

      if (characteristics[sensorName].type === "float") {
        // decode float value
        // const textDecoder = new TextDecoder("ascii");
        // value = parseFloat(textDecoder.decode(event.target.value.buffer));
        value = new Float32Array(event.target.value.buffer)[0];
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
              console.log("startNotifications");
              try {
                await characteristic.startNotifications();
              } catch (err) {
                console.error("Bluetooth error (startNotifications): ", err, characteristic.properties);
              }
              setNotificationsStarted(true);
            }
            console.log("add characteristicvaluechanged");
            try {
              characteristic.addEventListener(
                "characteristicvaluechanged",
                handleCharacteristicValueChanged
              );
            } catch (err) {
              console.error("Bluetooth error (addEventListener characteristicvaluechanged): ", err);
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
  }, [isConnected, comGndBtService, btCharacteristic, notificationsStarted]);

  //   console.log("value changed", sensorValue, timeStamp);
  return [sensorValue, timeStamp, setValue];
}
