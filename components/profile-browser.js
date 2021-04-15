import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Box, Button, Grid, Text, Layer, Anchor, Collapsible } from "grommet";
import useLocalStorage from "../hooks/use-local-storage";
import Chart from "../components/chart";

export default function ProfileBrowser({}) {
  const [profilesData, setProfilesData] = useState();

  useEffect(async () => {
    const getAllProfiles = async () => {
      let items = {};
      if (global.window) {
        for (let itemKey in { ...localStorage }) {
          console.log("found item", itemKey);
          if (itemKey.includes(":recipe")) {
            const recipe = JSON.parse(localStorage.getItem(itemKey));
            const profileName = recipe.profileName;
            if (!items[profileName]) {
              items[profileName] = [];
            }
            items[profileName].push(recipe);
          }
        }
      }
      console.log("items", items);
      return items;
    };
    const profileList = await getAllProfiles();
    const profileFile = "time-and-pressure-profile.js";
    const profileLoader = await import(`../profiles/${profileFile}`);
    const profileClass = profileLoader.default;
    console.log("profileClass", profileClass);
    const profile = new profileClass(
      profileList["Pressure Profile - 5 Stage"][0]
    );
    console.log(
      "profileList['Pressure Profile - 5 Stage']",
      profileList["Pressure Profile - 5 Stage"]
    );
    setProfilesData(profileList);
  }, [profilesData]);

  //   profile.setParameters(profileList['Pressure Profile - 5 Stage'][0]);

  return <Box>{profilesData && Object.keys(profilesData).map((profileName, i) => 
    <Text> {profileName}</Text>
  )}</Box>;
}
