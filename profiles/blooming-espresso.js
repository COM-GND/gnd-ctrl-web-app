import { interpolateBasis, quantize } from "d3-interpolate";
import {
  interpolateFromCurve,
  interpolateMonotoneX,
} from "d3-interpolate-curve";
// import {interpolateMonotoneX} from "d3-shape";

export default class bloomingEspresso {
  constructor(recipe) {
    this.paramaters = paramaters;
    this.recipe = recipe ? recipe : this.getDefaultRecipe();
  }

  getDefaultRecipe() {
    const recipe = this.paramaters.slice().map((stage) => {
      const recipeStage = {
        time: { value: stage.time.defaultValue },
      };
      if (stage?.pressure) {
        recipeStage.pressure = {};
        recipeStage.pressure.value = stage.pressure.defaultValue;
      }
      return recipeStage;
    });
    return recipe;
  }

  getProfile() {
    let timeAcc = 0;
    let currPressure = 0;
    const profile = this.recipe.map((stage) => {
      const t = timeAcc;
      timeAcc += stage.time.value;
      currPressure = stage?.pressure ? stage.pressure.value : currPressure;
      return { t: timeAcc * 1000, bars: currPressure };
    });
    const series = [{ t: 0, bars: 0 }, ...profile];
    return series;
  }

  getSmoothProfile() {
    const series = this.getProfile();

    const tSmoothed = quantize(
      interpolateMonotoneX(series.map((item) => item.t)),
      30
    );
    const barsSmoothed = quantize(
      interpolateMonotoneX(series.map((item) => item.bars)),
      30
    );
    const smoothedSeries = tSmoothed.map((t, i) => {
      return { t: t, bars: barsSmoothed[i] };
    });

    //   const smoothedSeries = getCurvedProfile(series);
    return smoothedSeries;
  }

  getTotalTime() {
    const profile = this.getProfile();
    const totalTime = profile[profile.length - 1].t;
    return totalTime;
  }

  getStateAtTime(t) {
    const profile = this.getProfile();
  
    const totalTime = this.getTotalTime();
    if(t > totalTime) {
     throw(`time ${t} is greater than the total profile duration ${totalTime}`) 
    }
    const timePerc = t / totalTime;
    const timePolater = interpolateMonotoneX(profile.map((item) => item.t));
    const barsPolater = interpolateMonotoneX(profile.map((item) => item.bars));
    const state = {
      t: timePolater(timePerc),
      bars: barsPolater(timePerc),
    };
    return state;
  }

  /**
   * Find the current stage of the recipe;
   * @param {int} time - the current time stamp
   */
  getStage(time) {
    let timeAcc = 0;
    let currStage;
    recipe.forEach((stage, i) => {
      let stageStartTime = timeAcc;
      let stageEndTime = stageStartTime + stage.time.value;
      if (time >= stageStartTime && time < stageEndTime) {
        currStage = i;
      }
      timeAcc += stage.time.value;
    });
    return currStage;
  }
}

export function getProfile() {
  let timeAcc = 0;
  let currPressure = 0;
  const profile = paramaters.map((stage) => {
    const t = timeAcc;
    timeAcc += stage.time?.value || stage.time.defaultValue;
    currPressure = stage?.pressure
      ? stage.pressure?.value || stage.pressure.defaultValue
      : currPressure;
    return { t: timeAcc * 1000, bars: currPressure };
  });
  const series = [{ t: 0, bars: 0 }, ...profile];
  //   const tSmoothed = quantize(interpolateBasis(series.map(item => item.t)), 20);
  //   const barsSmoothed = quantize(interpolateBasis(series.map(item => item.bars)), 20);
  //   const smoothedSeries = tSmoothed.map((t, i) => {
  //       return {t: t, bars: barsSmoothed[i]}
  //   });

  const tSmoothed = quantize(
    interpolateMonotoneX(series.map((item) => item.t)),
    30
  );
  const barsSmoothed = quantize(
    interpolateMonotoneX(series.map((item) => item.bars)),
    30
  );
  const smoothedSeries = tSmoothed.map((t, i) => {
    return { t: t, bars: barsSmoothed[i] };
  });

  //   const smoothedSeries = getCurvedProfile(series);
  return smoothedSeries;
}

export function getSmoothProfile(profile) {}

const paramaters = [
  {
    name: "Pre Infusion",
    time: {
      name: "Pre-infusion Time",
      id: "pre-infusion-time",
      type: "time",
      min: 0,
      max: 20,
      defaultValue: 5,
      unit: "seconds",
      control: "slider",
    },
    pressure: {
      name: "Pre-infusion Pressure",
      id: "pre-infusion-pressure",
      type: "pressure",
      min: 0,
      max: 10,
      defaultValue: 3,
      unit: "bars",
      control: "slider",
    },
  },
  {
    name: "Bloom",
    time: {
      defaultValue: 10,
    },
  },
  {
    name: "Ramp",
    time: {
      name: "Pressure Ramp-up Time",
      id: "pressure-ramp-up-time",
      type: "time",
      min: 0,
      max: 10,
      defaultValue: 5,
      unit: "seconds",
      control: "slider",
    },
    pressure: {
      defaultValue: 9,
    },
  },
  {
    name: "Infusion",
    time: {
      name: "Infusion Time",
      id: "infusion-time",
      type: "time",
      min: 0,
      max: 60,
      defaultValue: 30,
      unit: "seconds",
      control: "slider",
    },
    pressure: {
      name: "Infusion Pressure",
      id: "infusion-pressure",
      type: "pressure",
      min: 0,
      max: 10,
      defaultValue: 8,
      unit: "bars",
      control: "slider",
    },
  },
];

function getCurvedProfile(profile) {
  const points = [];
  profile.forEach((item) => {
    points.push(item.t);
    points.push(item.bars);
  });
  const curvedPoints = getCurvePoints(points, 0.1);

  const curvedProfile = [];
  for (let i = 0; i < curvedPoints.length; i += 2) {
    const datum = {
      t: curvedPoints[i],
      bars: curvedPoints[i + 1],
    };
    curvedProfile.push(datum);
  }
  return curvedProfile;
}

// https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
// supposed to calc a cardinal spline
function getCurvePoints(pts, tension, isClosed, numOfSegments) {
  // use input value if provided, or use a default value
  tension = typeof tension != "undefined" ? tension : 0.25;
  isClosed = isClosed ? isClosed : false;
  numOfSegments = numOfSegments ? numOfSegments : 16;

  var _pts = [],
    res = [], // clone array
    x,
    y, // our x,y coords
    t1x,
    t2x,
    t1y,
    t2y, // tension vectors
    c1,
    c2,
    c3,
    c4, // cardinal points
    st,
    t,
    i; // steps based on num. of segments

  // clone array so we don't change the original
  //
  _pts = pts.slice(0);

  // The algorithm require a previous and next point to the actual point array.
  // Check if we will draw closed or open curve.
  // If closed, copy end points to beginning and first points to end
  // If open, duplicate first points to befinning, end points to end
  if (isClosed) {
    _pts.unshift(pts[pts.length - 1]);
    _pts.unshift(pts[pts.length - 2]);
    _pts.unshift(pts[pts.length - 1]);
    _pts.unshift(pts[pts.length - 2]);
    _pts.push(pts[0]);
    _pts.push(pts[1]);
  } else {
    _pts.unshift(pts[1]); //copy 1. point and insert at beginning
    _pts.unshift(pts[0]);
    _pts.push(pts[pts.length - 2]); //copy last point and append
    _pts.push(pts[pts.length - 1]);
  }

  // ok, lets start..

  // 1. loop goes through point array
  // 2. loop goes through each segment between the 2 pts + 1e point before and after
  for (i = 2; i < _pts.length - 4; i += 2) {
    for (t = 0; t <= numOfSegments; t++) {
      // calc tension vectors
      t1x = (_pts[i + 2] - _pts[i - 2]) * tension;
      t2x = (_pts[i + 4] - _pts[i]) * tension;

      t1y = (_pts[i + 3] - _pts[i - 1]) * tension;
      t2y = (_pts[i + 5] - _pts[i + 1]) * tension;

      // calc step
      st = t / numOfSegments;

      // calc cardinals
      c1 = 2 * Math.pow(st, 3) - 3 * Math.pow(st, 2) + 1;
      c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
      c3 = Math.pow(st, 3) - 2 * Math.pow(st, 2) + st;
      c4 = Math.pow(st, 3) - Math.pow(st, 2);

      // calc x and y cords with common control vectors
      x = c1 * _pts[i] + c2 * _pts[i + 2] + c3 * t1x + c4 * t2x;
      y = c1 * _pts[i + 1] + c2 * _pts[i + 3] + c3 * t1y + c4 * t2y;

      //store points in array
      res.push(x);
      res.push(y);
    }
  }

  return res;
}
