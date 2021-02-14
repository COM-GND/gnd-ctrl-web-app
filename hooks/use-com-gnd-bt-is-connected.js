import { useState, useEffect } from "react";

export default function useComGndBtIsConnected(device) {
  const [isConnected, setIsConnected] = useState(null);

  useEffect(() => {
    function handleBtDisconnect() {
      setIsConnected(false);
    }

    if (device) {
      setIsConnected(device.gatt.connected);

      device.addEventListener("gattserverdisconnected", handleBtDisconnect);
    }
    return () => {
      if (device) {
        device.removeEventListener(
          "gattserverdisconnected",
          handleBtDisconnect
        );
      }
    };
  }, [device]);

  return isConnected;
}
