import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Box, Button, Grid, Text, Layer, Anchor, Collapsible } from "grommet";
import useLocalStorage from "../hooks/use-local-storage";
import Chart from "../components/chart";
import profile from "../profiles/time-and-pressure-profile";

export default function ProfileBrowser({
  onAdd = () => {},
  onOpen = () => {},
}) {
  const [profilesData, setProfilesData] = useState();
  const [maxTimeDomain, setMaxTimeDomain] = useState(0);

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

    let maxTime = 0;
    profileList = profileList.map((profileData) => {
      console.log("profileData", profileData);
      const previewData = profileClass.recipeToTimeSeriesData(profileData);
      const newProfileData = Object.assign(profileData, {
        previewData: previewData,
      });
      if(previewData.length > 0 & previewData[previewData.length-1].t > maxTime){
        maxTime =  previewData[previewData.length-1].t;
      }
      return newProfileData;
    }).sort((a, b) => {
      const nameA = a.recipeName.toLowerCase();
      const nameB = b.recipeName.toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    // For better comparison, we want all the charts to share the same time-domain 
    setMaxTimeDomain(maxTime);
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
                  <Box>
                    <Text size="small"> {data.recipeName}</Text>
                    <Text size="xsmall">{data.profileName}</Text>
                  </Box>
                  <Box height="120px">
                  <Chart recipeData={data.previewData} zoom="fit" timeDomain={maxTimeDomain}/>
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
