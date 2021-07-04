import { useState, useContext, useEffect } from "react";
import StorageContext from "../contexts/storage-context";

// import { Storage } from "@ionic/storage";
// import StorageContext from "../contexts/storage-context";

// https://usehooks.com/useLocalStorage/

export default function useLocalStorage(key, initialValue) {
  const store = useContext(StorageContext);

  const [value, setValue] = useState(initialValue);
  const [storedValue, setStoredValue] = useState();
  
  /* On first load, check if value is in local storage */
  useEffect(async () => {
    const storeVal = await store.get(key);
    console.log('found stored value', storeVal);
    if(storeVal) {
      setValue(storeVal);
    }
    // setValue(initialValue);
  }, []);

  /* Update stored value async when value changes */
  useEffect(async ()=> {
    console.log('saving stored value',  value);
    await store.set(key, value);
    setStoredValue(value);
  }, [value]);

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  // const [storedValue, setStoredValue] =  useState(async () => {
  //   const storeVal = await store.get(key);
  //   if (storeVal) {
  //     return storedValue;
  //   } else {
  //     return initialValue;
  //   }
  //   try {
  //     // Get from local storage by key
  //     // there's no window during ssr
  //     if (typeof global.window === undefined) {
  //       return initialValue;
  //     }
  //     const item = global.window && window.localStorage.getItem(key);
  //     // Parse stored json or if none return initialValue
  //     return item ? JSON.parse(item) : initialValue;
  //   } catch (error) {
  //     // If error also return initialValue
  //     console.log("Error reading from local storage: ", error);
  //     return initialValue;
  //   }
  // });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  // const setValue = async (value) => {
  //   const valueToStore = value instanceof Function ? value(storedValue) : value;

  //   setValue(valueToStore);

    // try {
    //   // Allow value to be a function so we have same API as useState
    //   const valueToStore =
    //     value instanceof Function ? value(storedValue) : value;
    //   // Save state
    //   setStoredValue(valueToStore);
    //   // Save to local storage
    //   window.localStorage.setItem(key, JSON.stringify(valueToStore));
    // } catch (error) {
    //   // A more advanced implementation would handle the error case
    //   console.log('Error writing to local storage: ', error);
    // }
  // };

  return [value, setValue];
}
