import react, { useRef } from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import useDimensions from "react-cool-dimensions";
import { ResizeObserver } from "@juggle/resize-observer";
import filterPressureData from "../utils/filter-pressure-data";

const MemoizedLineChart = react.memo(LineChart);

export default function Chart({
  sensorDataHistory,
  profileDataHistory,
  temperatureDataHistory,
  flowDataHistory,
  recipeData = [],
  timeDomain = 60000,
  pressureTarget,
  zoom = 1,
}) {
  const userScrolledRef = useRef(false);

  const { ref, width, height } = useDimensions({ polyfill: ResizeObserver });

  const mostRecentSensorT =
    sensorDataHistory && sensorDataHistory.length > 0
      ? sensorDataHistory[sensorDataHistory.length - 1].t
      : 0;

  const xMax = Math.max(mostRecentSensorT, timeDomain, 1);
  const pxPerMs = (() => {
    if (zoom === "fit") {
      if (xMax / 1000 > width) {
        console.log("scale down", xMax, width);
        return width / xMax;
      } else {
        const scaled = width / xMax;
        console.log("scale up", xMax, width, scaled);
        return scaled;
      }
    } else {
      return 0.025 * zoom;
    }
  })();

  //zoom == 'fit' ? width / (xMax)  : 0.025 * zoom;

  const tMin = 0;
  // max Time is the larger of the sensorData max t, the recipeData max t, the timeDomain,
  // or the available space in the window.
  const tMax = Math.round(
    Math.max(
      xMax,
      recipeData && recipeData.length > 1
        ? recipeData[recipeData.length - 1].t
        : 0,
      width / pxPerMs
    )
  );
  const tRange = tMax - tMin;

  const filteredSensorDataHistory = sensorDataHistory; //filterPressureData(sensorDataHistory);

  // recharts will fit the tRange into the available width
  // ie. rechartsScale = (width / tRange)
  // we need to invert that
  // ie. (tRange / width)

  const chartHPadding = 0;
  const chartContainerWidth = width + chartHPadding;
  const rechartsScaleFactor = chartContainerWidth / tRange || 1;
  const rechartsNormalizationFactor = 1 / rechartsScaleFactor;
  const chartWidth =
    rechartsNormalizationFactor * chartContainerWidth * pxPerMs;
  const chartVisibleMs = (chartContainerWidth / chartWidth) * tRange;

  const playHeadXPos = mostRecentSensorT * pxPerMs;

  // const sensorDatHistoryLineWidth =
  //   rechartsNormalizationFactor *
  //     sensorDataHistory[sensorDataHistory.length - 1].t || 0;

  // console.log(
  //   "tRange",
  //   tRange,
  //   "rechartsScaleFactor",
  //   rechartsScaleFactor,
  //   "rechartsNormalizationFactor",
  //   rechartsNormalizationFactor,
  //   "chartWidth",
  //   chartWidth,
  //   "playHeadXPos",
  //   playHeadXPos
  // );

  // TODO the recipe line with curve smoothing causes rechart performance issues when it the chart redraws.
  // look for ways to improve performance
  // if(recipeData[recipeData.length - 1].t < xMin) {
  //   recipeData = [recipeData.pop()];
  // }

  // if the sensorData time goes past the end of the recipe, extend the recipe's last pressure out
  if (recipeData.length > 1 && recipeData[recipeData.length - 1].t < xMax) {
    //recipeData.push({ t: xMax, bars: recipeData[recipeData.length - 1].bars });
  }

  if (ref.current) {
    const isRightAligned =
      ref.current.scrollWidth - Math.abs(ref.current.scrollLeft) <=
      ref.current.clientWidth + 10;
    // console.log(
    //   "left", ref.current.scrollWidth - Math.abs(ref.current.scrollLeft),
    //   "clientWidth",
    //   ref.current.clientWidth
    // );
    if (isRightAligned) {
      userScrolledRef.current = false;
    }

    let shouldScroll = false;
    if (
      userScrolledRef.current == false &&
      playHeadXPos > chartContainerWidth
    ) {
      shouldScroll = true;
      ref.current.scrollTo({
        left: playHeadXPos - width / 2, // scroll the container so that the playhead is centered.
        top: 0,
        behavior: "smooth",
      });
    }
    // console.log(
    //   "isRightAligned",
    //   "right",
    //   isRightAligned,
    //   "touched",
    //   userScrolledRef.current,
    //   "should",
    //   shouldScroll
    // );
  }

  // if (
  //   ref.current &&
  //   // userScrolledRef.current === false &&
  //   playHeadXPos > chartContainerWidth
  // ) {
  //   ref.current.scrollTo({
  //     left: playHeadXPos,
  //     top: 0,
  //     behavior: "smooth",
  //   });
  // }

  const renderTick = ({ x, y, stroke, payload }) => (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={8}
        textAnchor="middle"
        fill="#666"
        style={{ fontSize: "10px" }}
      >
        {Math.round(payload.value / 1000)}
      </text>
    </g>
  );

  return (
    <div
      ref={ref}
      className="chart__scroll"
      onWheel={() => (userScrolledRef.current = true)}
      onTouchMove={() => (userScrolledRef.current = true)}
      style={{
        width: "100%",
        height: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        display: "flex",
        /* When the live data line is wider than the visible chart, stick to the right of the scroll */
        /*flexDirection:
        sensorDataHistory[sensorDataHistory.length - 1].t > chartVisibleMs ? "row-reverse" : "row",*/
      }}
    >
      <MemoizedLineChart
        width={chartWidth}
        height={height}
        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
      >
        <CartesianGrid
          vertical={false}
          strokeWidth={1}
          stroke={"hsla(0, 0%, 100%, .1)"}
        />

        <YAxis
          dataKey="bars"
          domain={[0, 10]}
          interval={0}
          // minTickGap={10}
          type="number"
          allowDataOverflow={true}
          axisLine={false}
          tickCount={10}
          width={10}
          mirror={true}
          hide={true}
        />
        <XAxis
          dataKey="t"
          // interval={0}
          allowDecimals={true}
          type="number"
          tickCount={Math.floor(tRange / 1000) + 1}
          domain={[0, (max) => (chartVisibleMs > xMax ? chartVisibleMs : xMax)]}
          tickFormatter={(value) => parseFloat(value / 1000).toFixed(0)}
          tick={renderTick}
        />
        {/* <Tooltip /> */}
        {/* <CartesianGrid stroke="#f5f5f5" /> */}

        {/* The projected profile pressure profile */}
        <Line
          name="Recipe Profile"
          isAnimationActive={false}
          id="recipe-profile"
          type="monotoneX"
          data={recipeData}
          dataKey="bars"
          stroke="hsla(0, 0%, 100%, .2)"
          strokeWidth={6}
          dot={{ fill: "hsla(0, 0%, 100%, .5)", strokeWidth: 0, r: 3 }}
        />
        {/* Realtime Pressure Sensor Graph */}
        {filteredSensorDataHistory && (
          <Line
            name="Live Pressure"
            isAnimationActive={false}
            name="live-bars"
            id="live-bars"
            dataKey="bars"
            data={filteredSensorDataHistory}
            stroke="hsla(0, 0%, 100%, 1)"
            dot={false}
            // dot={{ fill: "hsla(0, 0%, 100%, .5)", strokeWidth: 0, r: 4 }}
          />
        )}
        {/* The Dotted line showing target pressure sent to machine as it is generated by the profile runner*/}
        {profileDataHistory && (
          <Line
            name="Target Pressure"
            dot={{ fill: "hsla(0, 0%, 100%, .5)", strokeWidth: 0, r: 1 }}
            stroke="hsla(0, 0%, 100%, 0)"
            isAnimationActive={false}
            name="target-bars"
            id="target-bars"
            dataKey="bars"
            data={profileDataHistory}
          />
        )}
        {filteredSensorDataHistory && (
          <Line
            name="Pump Level"
            isAnimationActive={false}
            id="live-pump-level"
            dataKey="pump"
            data={filteredSensorDataHistory}
            stroke="hsla(0, 0%, 50%, 1)"
            dot={false}
          />
        )}
        {/* {filteredSensorDataHistory&& <Line 
          isAnimationActive={false}
          name="Boiler Temperature"
          id="boiler-temp"
          dataKey="c"
          strokeDashArray="4 1"
          data={filteredSensorDataHistory}
          stroke="hsla(0, 0%, 50%, 1)"
          dot={false}
        />} */}

        {temperatureDataHistory && (
          <Line
            isAnimationActive={false}
            name="Boiler Temperature"
            id="boiler-temp"
            dataKey="c"
            data={temperatureDataHistory}
            stroke="red"
            dot={false}
          />
        )}

        {flowDataHistory && (
          <Line
            isAnimationActive={false}
            name="Flow Rate"
            id="flow"
            dataKey="flow"
            data={flowDataHistory}
            stroke="hsla(0, 0%, 50%, 1)"
            dot={false}
          />
        )}

        {pressureTarget && (
          <ReferenceLine
            y={pressureTarget}
            stroke="hsla(0, 0%, 100%, .9"
            strokeDasharray="1 4"
          />
        )}
      </MemoizedLineChart>
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
