/**
 * reCharts chokes when there is too many data points - we filter out the noise to improve the performance
 * @param {array} data - pressure sensor data in the shape of {t: int, bars: float}
 */
export default function filterPressureData (data) {
    const minVariance = .02;
    const filteredData = data.filter((datum, i, data) => {
        if(i > 0 && i < data.length - 1 ) {
            const lastBars = data[i-1].bars;
            const currBars = datum.bars;
            const nextBars = data[i+1].bars;
            const variance = (lastBars + nextBars) / 2
            if (Math.abs(lastBars - currBars) > minVariance && Math.abs(lastBars - nextBars) > minVariance) {
                return true;
            } else if(data.length > 3) {
                return false;
            }
        }
        return true;
    });
    // console.log('f', filteredData);
    return filteredData;
}