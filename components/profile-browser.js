import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Box, Button, Grid, Text, Layer, Anchor, Collapsible } from "grommet";
import useLocalStorage from "../hooks/use-local-storage";
import Chart from "../components/chart";

export default function ProfileBrowser({
  onAdd = () => {},
  onOpen = () => {},
}) {
  const [profilesData, setProfilesData] = useState();
  const [groupBy, setGroupBy] = useState(); //oneOf none, profileName
  useEffect(async () => {
    const getAllProfiles = async () => {
      let items = [];
      if (global.window) {
        for (let itemKey in { ...localStorage }) {
          console.log("found item", itemKey);
          if (itemKey.includes(":recipe")) {
            const recipe = JSON.parse(localStorage.getItem(itemKey));
            const profileName = recipe.profileName;
            // if (!items[profileName]) {
            //   items[profileName] = [];
            // }
            // items[profileName].push(recipe);
            items.push(recipe);
          }
        }
      }
      console.log("items", items);
      return items;
    };

    let profileList = await getAllProfiles();
    const profileFile = "time-and-pressure-profile.js";
    const profileLoader = await import(`../profiles/${profileFile}`);
    const profileClass = profileLoader.default;
    console.log("profileClass", profileClass);
    // const profile = new profileClass(
    //   profileList["Pressure Profile - 5 Stage"][0]
    // );
    profileList = profileList.map((profileData) => {
      console.log("profileData", profileData);
      const previewData = profileClass.recipeToTimeSeriesData(profileData);
      const newProfileData = Object.assign(profileData, {
        previewData: previewData,
      });
      return newProfileData;
    });
    // const profileTimeSeries = profileClass.recipeToTimeSeriesData(
    //   profileList[0]
    // );
    // profileList[0]["previewData"] = profileTimeSeries;

    setProfilesData(profileList);
  }, []);

  //   profile.setParameters(profileList['Pressure Profile - 5 Stage'][0]);
  console.log("profilesData", profilesData);
  return (
    <Box fill={true} overflow={{ vertical: "scroll" }}>
      <Grid
        columns="small"
        rows="small"
        pad="medium"
        gap="xsmall"
        align="center"
        alignContent="center"
      >
        {profilesData &&
          profilesData.map((data, i) => {
            //const data = profilesData[profileName];
            console.log("data", data);
            return (
              <Button
                style={{display: "block",  width:"100%",  height:"100%"}}
               
                key={`profile_${i}`}
                onClick={() => {
                  onOpen(data);
                }}
              >
                <Box
                  height="100%"
                  width="100%"
                  background="dark-1"
                  pad="small"
                  overflow="hidden"
                  justify="between"
                >
                  <Box flex={{grow: true}}>
                    <Text size="small"> {data.recipeName}</Text>
                    <Text size="xsmall">{data.profileName}</Text>
                  </Box>
                  <Box height="120px">
                  <Chart recipeData={data.previewData} zoom="fit" />
                  </Box>
                </Box>
              </Button>
            );
          })}
        <Button
          label="Add"
          onClick={() => {
            const newId = uuidv4();
            onAdd(newId);
          }}
        />
      </Grid>
    </Box>
  );
}
