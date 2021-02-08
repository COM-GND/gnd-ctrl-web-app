import react, { useRef } from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
} from "recharts";

import bloomingEspresso from "../profiles/blooming-espresso";

export default function Chart({ liveData }) {
  // console.log(data, pressureData);

  const profiler = new bloomingEspresso();

  const profile = profiler.getProfile();
  console.log("profile", profile);
  const totalSeconds = profiler.getTotalTime() / 1000;
//   console.log("totalSeconds", totalSeconds);
//   const timeIntervals = new Array(totalSeconds).fill(0).map((t, i) => {
//     return { time: i * 1000 };
//   });

  return (
    <div>
      <LineChart
        width={600}
        height={400}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <YAxis
          dataKey="bars"
          domain={[0, 10]}
          interval={1}
          type="number"
          interval="preserveStartEnd"
        />
        <XAxis
          dataKey="t"
          interval="preserveStartEnd"
          allowDecimals={false}
          type="number"
          tickCount={Math.floor((totalSeconds-1)/5)}
          domain={[0, totalSeconds]}
          tickFormatter={(value) => parseFloat(value / 1000).toFixed(0)}
        />
        {/* <Tooltip /> */}
        {/* <CartesianGrid stroke="#f5f5f5" /> */}

        <Line
          name="recipe-bars"
          id="recipe-profile"
          type="monotone"
          data={profile}
          dataKey="bars"
          stroke="#ff7300"
          isAnimationActive={true}
        />
        <Line name="live-bars" id="live0bars" dataKey="bars" data={liveData} />
      </LineChart>
    </div>
  );
}

// todo: https://www.npmjs.com/package/d3-interpolate-curve

var findYatXbyBisection = function (x, path, error) {
  var length_end = path.getTotalLength(),
    length_start = 0,
    point = path.getPointAtLength((length_end + length_start) / 2), // get the middle point
    bisection_iterations_max = 50,
    bisection_iterations = 0;

  error = error || 0.01;

  while (x < point.x - error || x > point.x + error) {
    // get the middle point
    point = path.getPointAtLength((length_end + length_start) / 2);

    if (x < point.x) {
      length_end = (length_start + length_end) / 2;
    } else {
      length_start = (length_start + length_end) / 2;
    }

    // Increase iteration
    if (bisection_iterations_max < ++bisection_iterations) break;
  }
  return point.y;
};
