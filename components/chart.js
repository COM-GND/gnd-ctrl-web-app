import react, { useRef } from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ResponsiveContainer
} from "recharts";

import bloomingEspresso from "../profiles/blooming-espresso";

export default function Chart({
  liveData,
  profileRunnerData,
  recipeData,
  timeDomain = 60,
}) {
  // console.log(data, pressureData);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        <CartesianGrid
          vertical={false}
          strokeWidth={1}
          stroke={"hsla(0, 0%, 100%, .1)"}
        />
        <YAxis
          dataKey="bars"
          domain={[0, 10]}
          interval="preserveEnd"
          // minTickGap={10}
          type="number"
          allowDataOverflow={true}
          axisLine={false}
          tickCount={10}
          width={10}
          mirror={true}
        />
        <XAxis
          dataKey="t"
          interval="preserveStartEnd"
          allowDecimals={true}
          type="number"
          tickCount={Math.floor(timeDomain / 5000) + 1}
          domain={[0, timeDomain]}
          tickFormatter={(value) => parseFloat(value / 1000).toFixed(0)}
        />
        {/* <Tooltip /> */}
        {/* <CartesianGrid stroke="#f5f5f5" /> */}

        <Line
          name="Recipe Profile"
          id="recipe-profile"
          type="monotone"
          data={recipeData}
          dataKey="bars"
          stroke="hsla(0, 0%, 100%, .2)"
          isAnimationActive={true}
          strokeWidth={6}
          dot={{ fill: "hsla(0, 0%, 100%, .5)", strokeWidth: 0, r: 3 }}
        />
        <Line
          name="Live Pressure"
          isAnimationActive={false}
          name="live-bars"
          id="live-bars"
          dataKey="bars"
          data={liveData}
          stroke="hsla(0, 0%, 100%, 1)"
          dot={false}
          // dot={{ fill: "hsla(0, 0%, 100%, .5)", strokeWidth: 0, r: 4 }}
        />
        <Line
          name="Target Pressure"
          dot={{ fill: "hsla(0, 0%, 100%, .5)", strokeWidth: 0, r: 1 }}
          stroke="hsla(0, 0%, 100%, 0)"
          isAnimationActive={false}
          name="target-bars"
          id="target-bars"
          dataKey="bars"
          data={profileRunnerData}
        />
      </LineChart>
    </ResponsiveContainer>
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
