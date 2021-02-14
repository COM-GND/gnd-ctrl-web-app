import { interpolateBasis, quantize } from "d3-interpolate";
import { interpolateMonotoneX } from "d3-interpolate-curve";

/**
 * @typedef {object} StageParamater
 * @property {string} name - name of paramater
 * @property {string} id - unique id of paramater
 * @property {string} type - the type of paramater (eg. time, pressure, temperature, etc)
 * @property {number} value - the value of the paramater
 */
/**
 * A number, or a string containing a number.
 * @typedef {object} Stage
 * @property {string} name - name of stage
 * @property {StageParamater} time - the time paramater of the stage
 * @property {StageParamater} [key: string] - a variable set profile paramaters for the stage
 */

/**
 * A recipe is composed of an array of Stage objects
 * @typedef {Stage[]} Recipe
 */

export default class profile {
  /**
   * Constructor
   * @param {Recipe} recipe
   */
  constructor(recipe) {}

  /**
   * Set the recipe for the profile
   * @param {Recipe} recipe
   */
  setRecipe(recipe) {
    this.recipe = recipe;
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

  /**
   * Get the profiles total length, in miliseconds
   */
  getTotalMs() {
    const profile = this.getProfile();
    const totalTime = profile[profile.length - 1].t;
    return totalTime;
  }


  /**
   * Get the target machine state at the give time given in seconds
   * @param {int} t - time in seconds
   */
  getStateAtTime(t) {
    const profile = this.getProfile();

    const totalTime = this.getTotalMs();
    if (t > totalTime) {
      throw `time ${t} is greater than the total profile duration ${totalTime}`;
    }
    const timePerc = t / totalTime;
    const timePolater = interpolateMonotoneX(profile.map((item) => item.t));
    const barsPolater = interpolateMonotoneX(profile.map((item) => item.bars));
    const state = {
      t: t,
      bars: this.findYatXbyBisection(
        t, // time position in MS
        timePolater, // time interpolater
        barsPolater, // pressure interpolater
        50 // allowed error in MS
      ),
    };
    return state;
  }

  /**
   * based on solution found here:
   * https://stackoverflow.com/questions/11503151/in-d3-how-to-get-the-interpolated-line-data-from-a-svg-line/39442651#39442651
   * @param {int} x - the x position to find the y value for
   * @callback xPolator - the x interpolator function
   * @callback yPolator - the y interpolator function
   * @param {int} error -
   */
  findYatXbyBisection(x, xPolator, yPolator, error = 5) {
    const point = { x: xPolator(0.5), y: yPolator(0.5) }; // get the middle point
    const bisection_iterations_max = 50;
    let segmentStart = 0;
    let segmentEnd = 1;

    let bisection_iterations = 0;

    error = error || 0.01;

    while (x < point.x - error || x > point.x + error) {
      // get the middle point
      // point = path.getPointAtLength((length_end + length_start) / 2)
      point.x = xPolator((segmentEnd + segmentStart) * 0.5);
      point.y = yPolator((segmentEnd + segmentStart) * 0.5);

      if (x < point.x) {
        // length_end = (length_start + length_end)/2
        segmentEnd = (segmentStart + segmentEnd) * 0.5;
      } else {
        // length_start = (length_start + length_end)/2
        segmentStart = (segmentStart + segmentEnd) * 0.5;
      }

      // Increase iteration
      if (bisection_iterations_max < ++bisection_iterations) break;
    }
    return point.y;
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
