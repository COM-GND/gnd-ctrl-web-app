export default function useComGndBtIsConnected(device) {
    const [isConnected, setIsConnected] = useState(null)
    
    useEffect(() => {

        setIsConnected(device.gatt.connected);

        function handleBtDisconnect() {
            setIsConnected(false);
        }

        device.addEventListener("gattserverdisconnected", handleBtDisconnect);
        return(() => {
            device.removeEventListener("gattserverdisconnected", handleBtDisconnect)
        })
    }, device);

    return isConnected;
  
}
