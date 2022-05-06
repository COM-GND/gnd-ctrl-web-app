import React, { useEffect, useState } from "react";
import { Storage } from "@ionic/storage";

const store = new Storage();

const StorageContext = React.createContext();

// https://ionicframework.com/blog/a-state-management-pattern-for-ionic-react-with-react-hooks/
// https://github.com/ionic-team/ionic-storage#usage-api

function StorageContextProvider(props) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [cache, updateCache] = useState();

  // Initialize local storage and load saved cache
  useEffect(async () => {
    await store.create();
    setIsInitialized(true);
    const storedValues = {};
    store.forEach((value, key) => {
      storedValues[key] = value;
    });
    updateCache(storedValues);
  }, []);

  const setStoredValue = async (key, value) => {
    await store.set(key, value);
  };

  const getStoredValue = async (key, val) => {
    const storedValue = await store.get(key);
    const oldCache = cache;
    const data = {};
    data[key] = storedValue;
    const newValues = Object.assign(oldCache, data);
    updateCache(newValues);
    return storedValue;
  };

  const removeStoredValue = async (key) => {
    console.log("removeStoredValue", key);
    await store.remove(key);
    const newCache = Object.assign({}, cache);
    if (newCache && newCache?.[key]) {
      delete newCache[key];
    }
    updateCache(newCache);
  };

  const value = {
    store,
    cache,
    isInitialized,
    setValue: (key, value) => {
      const oldValues = cache;
      const data = {};
      data[key] = value;
      const newValues = Object.assign(oldValues, data);
      updateCache(newValues);
      setStoredValue(key, value); // async without wait
    },
    getValue: (key) => {
      if (key in cache) {
        return cache[key];
      } else {
        // if value is not in cache, call method to pull from cache.
        // The state will be updated and the new value will be available in cache on next render.
        getStoredValue(key, value);
      }
    },
    removeValue: (key) => {
      removeStoredValue(key);
    },
  };

  return (
    <StorageContext.Provider value={value}>
      {isInitialized && props.children}
    </StorageContext.Provider>
  );
}

const StorageContextConsumer = StorageContext.Consumer;

export { StorageContext, StorageContextProvider, StorageContextConsumer };
