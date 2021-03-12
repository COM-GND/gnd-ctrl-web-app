// https://web.dev/wake-lock/
export default async function requestWakeLock(releaseAfterMinutes){
    let wakeLock = undefined;
    try {
      wakeLock = await navigator.wakeLock.request();
      wakeLock.addEventListener('release', () => {
        console.log('Screen Wake Lock released:', wakeLock && wakeLock.released);
      });
      if(releaseAfterMinutes) {
        window.setTimeout(() => {
            wakeLock.release();
            wakeLock = null;
          }, releaseAfterMinutes * 1000 * 60);
      }
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }

    return wakeLock;
  };


