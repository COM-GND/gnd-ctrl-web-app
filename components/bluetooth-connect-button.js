import react, { useState } from "react";
import { Button } from "grommet";
import comGndConfig from "../device-configs/com-gnd-default-config";
import BluetoothIcon from "../svgs/bluetooth-24px.svg";

export default function BluetoothConnectButton({
  onConnect = () => {},
  onDisconnect = () => {},
  onError = () => {},
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [btDevice, setBtDevice] = useState();
  const [btServer, setBtServer] = useState();

  const getIcon = (connected) => {};

  const bleCharIds = Object.keys(comGndConfig.bluetooth.characteristics).map(
    (charName) => comGndConfig.bluetooth.characteristics[charName].id
  );

  return (
    <div className="bluetooth-connect-button">
      <Button
        plain
        gap="xxsmall"
        icon={
          <BluetoothIcon
            viewBox="0 0 24 24"
            style={{ fill: "red", width: "16px", height: "16px" }}
          />
        }
        label={isConnected ? "Disconnect" : "Connect"}
        onClick={async (e) => {
          if (isConnected && btDevice) {
            try {
              btDevice.gatt.disconnect();
              onDisconnect();
              setIsConnected(false);
            } catch (error) {
              onError(error);
            }
          } else if (!isConnected && btDevice) {
            // permission has already been given to access paired device. reconnect.
            // https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTServer/connect
            const server = await btDevice.gatt.connect();
            setIsConnected(true);
            setBtServer(server);
            onConnect(btDevice, server);
          } else {
            // manual user input is required to give permission to access device.
            console.log("connect: ", e, navigator.bluetooth, comGndConfig.bluetooth.serviceId);
            let device, server, service, characteristic, value;
            try {
              device = await navigator.bluetooth.requestDevice({
                filters: [
                  {
                    name: "COM-GND Espresso",
                  },
                ],
                optionalServices: [comGndConfig.bluetooth.serviceId] //["8fc1ceca-b162-4401-9607-c8ac21383e4e"],
              });
            } catch (error) {
              console.error(error);
              onError(error);
            }

            if (device) {
              // setComGndBtDevice(device);
              setBtDevice(device);
              try {
                server = await device.gatt.connect();
                console.log("server", server);
                setIsConnected(true);
                setBtServer(server);
                onConnect(device, server);
              } catch (error) {
                console.error(error);
                onError(error);
              }
            }

            // if (server) {
            //   try {
            //     service = await server.getPrimaryService(0xffe0);
            //     console.log("service", service);
            //   } catch (error) {
            //     console.error(error);
            //   }
            // }

            // if (service) {
            //   try {
            //     characteristic = await service.getCharacteristic(0xffe1);
            //     console.log("characteristic", characteristic);
            //   } catch (error) {
            //     console.error(error);
            //   }
            // }

            // if (characteristic) {
            //   try {
            //     // https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTCharacteristic/readValue
            //     // readValue returns a promise for a DataView object
            //     // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
            //     // arduino stores floats as 32bit
            //     value = await characteristic.readValue();
            //     setActualPressure(value.getFloat32());
            //     console.log("value", value.getFloat32());
            //   } catch (error) {
            //     console.error(error);
            //   }
            // }
          }
        }}
      >
        {/* {isConnected ? "Disconnect" : "Connect"} */}
      </Button>
    </div>
  );
}
