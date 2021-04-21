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
    // const profile = new profileClass(
    //   profileList["Pressure Profile - 5 Stage"][0]
    // );
    const profileTimeSeries = profileClass.recipeToTimeSeriesData(
      profileList["Pressure Profile - 5 Stage"][0]
    );
    profileList["Pressure Profile - 5 Stage"][0][
      "previewData"
    ] = profileTimeSeries;
    console.log(
      "profileList['Pressure Profile - 5 Stage']",
      profileList["Pressure Profile - 5 Stage"]
    );
    setProfilesData(profileList);
  }, []);

  //   profile.setParameters(profileList['Pressure Profile - 5 Stage'][0]);
  console.log('profilesData', profilesData);
  return (
    <Box>
      {profilesData &&
        Object.keys(profilesData).map((profileName, i) => {
          const data = profilesData[profileName];
          console.log('data', data);
          return (
            <Box key={`profile_${i}`}  border={{color: "white"}} height="200px" width="200px">
              <Text> {profileName}</Text>
              <Text>{data[0].recipeName}</Text>
              <Chart recipeData={data[0].previewData}/>
            </Box>
          );
        })}
    </Box>
  );
}
