import { useCallback, useEffect } from "react";

// https://stackoverflow.com/questions/54666401/how-to-use-throttle-or-debounce-with-react-hook/54666498

export default function useDebouncedEffect(effect, delay , deps) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const callback = useCallback(effect, deps);

    useEffect(() => {
        const handler = setTimeout(() => {
            callback();
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [callback, delay]);
}