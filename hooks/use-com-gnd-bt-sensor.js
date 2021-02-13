import { useEffect } from "react";
import useComGndIsConnected from "./use-com-gnd-bt-is-connected";

export default function useComGndSensor(btDevice, sensorName) {
  const isConnected = useComGndIsConnected(btDevice);

  const [comGndBtService, setComGndBtService] = useState();
  const [btCharacteristic, setBtCharacteristic] = useState();
  const [notificationsStarted, setNotificationsStarted] = useState();
  const [sensorValue, setSensorValue] = useState(null);

  const serviceId = 0xffe0;
  const characteristics = {
    pressure: {
      id: 0xffe1,
      type: "float",
    },
  };

  useEffect(async () => {
    function handleCharacteristicValueChanged(event) {
      let value;
      if (characteristics[sensoreName].type === "float") {
        // decode float value
        const textDecoder = new TextDecoder("ascii");
        value = parseFloat(textDecoder.decode(event.target.value.buffer));
      } else {
        value = event.target.value.buffer;
      }

      setSensorValue(value);
    }

    if (isConnected) {
      try {
        const comGndBtServer = btDevice.gatt;

        if (!comGndBtService) {
          setComGndBtService(await comGndBtServer.getPrimaryService(serviceId));
        }
        // const comGndBtService = await comGndBtServer.getPrimaryService(serviceId);

        if (!btCharacteristic) {
          const characteristic = await comGndBtService.getCharacteristic(
            characteristics[sensorName].id
          );
          setBtCharacteristic(characteristic);
        }
      } catch (error) {
        console.error("Bluetooth Error", error);
      }

      if (btCharacteristic) {
        if (!notificationsStarted) {
          btCharacteristic.startNotifications();
          setNotificationsStarted(true);
        }

        btCharacteristic.addEventListener(
          "characteristicvaluechanged",
          handleCharacteristicValueChanged
        );
      }

      return () => {
        if (btCharacteristic) {
          btCharacteristic.removeEventListener(
            "characteristicvaluechanged",
            handleCharacteristicValueChanged
          );
        }
      };
    } else {
      setComGndBtService(null);
      setBtCharacteristic(null);
      setNotificationsStarted(false);
    }
  });

  return sensorValue;
}
