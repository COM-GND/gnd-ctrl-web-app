import { Box, Button } from "grommet";

// import Chart from './chart';
import ProfileRunner from "./profile-runner.js";
import bloomingEspresso from "../profiles/blooming-espresso";

const Chart = dynamic(() => import("../components/chart"), { ssr: false });

export default function Profiler({
  btConnected,
  liveSensorData,
  onStart = () => {},
  onPause = () => {},
  onStop = () => {},
  onEnd = () => {},
}) {
  const startTime = useRef(Date.now());
  const setStartTime = (time) => {
    startTime.current = time;
  };

  const [profile, setProfile] = useState(new bloomingEspresso());
  const [profileRecipe, setProfileRecipe] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [profileData, setProfileData] = useState([]);
  const [sensorDataHistory, updateSensorDataHistory] = useState([{ bars: 0, t: 0 }]);

  return (
    <Box direction="column" fill="horizontal">
      <Box fill="horizontal">
        <Chart
          liveData={isRunning ? sensorData : {}}
          profileRunnerData={profileData}
          timeDomain={profile.getTotalTime()}
          recipeData={profile.getProfile()}
        />
      </Box>
      <ProfileRunner
        profile={profile}
        onStateChange={(state) => {
          setProfileData((profileData) => {
            return [...profileData, state];
          });
          // send the target value to the machine. see: https://web.dev/bluetooth/#write
          if (comGndBtPressureCharacteristic && state.bars) {
            // const encodedPressure = Uint8Array.of(state.bars);
            const textDecoder = new TextDecoder("ascii");
            const encodedPressure = textDecoder.encode(state.bars.toString());
            try {
              characteristic.writeValue(encodedPressure);
            } catch (error) {
              console.error("Error writing to bluetooth", error);
            }
          }
        }}
        onStart={() => {
          //updateSensorData(() => [{ bars: 0, t: 0 }]);
          setStartTime(Date.now());
          setIsRunning(true);
        }}
        onPause={() => {
          setIsRunning(false);
        }}
        onStop={() => {
          setIsRunning(false);
          //updateSensorData(() => [{ bars: 0, t: 0 }]);
          setProfileData(() => [{ bars: 0, t: 0 }]);
        }}
      />
    </Box>
  );
}
