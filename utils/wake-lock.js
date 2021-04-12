// https://web.dev/wake-lock/
export default async function requestWakeLock(releaseAfterMinutes){
    let wakeLock = undefined;
    let timedOut = false;
    let timeoutId = null;

    try {
      wakeLock = await navigator.wakeLock.request();
      wakeLock.addEventListener('release', () => {
        console.log('Screen Wake Lock released:', wakeLock && wakeLock.released);
        // the browser can clear the wakelock when the page is blured (user changes tab or switch apps)
        // so if the release wasn't caused by the timeout, reset it when it becomes visible again
        if(!timedOut && timeoutId){
          window.clearTimeout(timeoutId);
          window.addEventListener('visibilitychange', () => {
            console.log('visibilitychange', document.visibilityState);
            if(document.visibilityState === 'visible') {
              requestWakeLock(releaseAfterMinutes); 
            }
          });
        }
      });
      if(releaseAfterMinutes) {
        timeoutId = window.setTimeout(() => {
            wakeLock.release();
            wakeLock = null;
            timedOut = true;
          }, releaseAfterMinutes * 1000 * 60);
      }
      console.log('Wake Lock set');
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }

    return wakeLock;
  };


