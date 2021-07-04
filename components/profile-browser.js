import dynamic from "next/dynamic";
import { useState, useEffect, useRef, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { Box, Button, Grid, Text, Layer, Anchor, Collapsible } from "grommet";
import { useSwipeable } from "react-swipeable";
import Swipeable from "./swipeable";
// import useLocalStorage from "../hooks/use-local-storage";
import {StorageContext} from "../contexts/storage-context";

import Chart from "../components/chart";
// import profile from "../profiles/time-and-pressure.profiler";

export default function ProfileBrowser({
  onAdd = () => {},
  onOpen = () => {},
}) {
  const [profilesData, setProfilesData] = useState();
  const [maxTimeDomain, setMaxTimeDomain] = useState(0);
  const [swipedProfileIndex, setSwipedProfileIndex] = useState(-1);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (e) => {
      console.log("swipeLeft", e);
    },
    onSwipeStart: (e) => {
      setIsSwiping();
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const storageContext = useContext(StorageContext);

  useEffect(async () => {
    const getAllProfiles = async () => {
      let items = [];
      await storageContext.store.forEach((value, key, index) => {
        console.log("found item", key);
        if (key.includes(":recipe")) {
          console.log("adding item", key);
          items.push(value);
        }
      });
      // for (let itemKey in { ...localStorage }) {
      //   console.log("found item", itemKey);
      //   if (itemKey.includes(":recipe")) {
      //     const recipe = JSON.parse(localStorage.getItem(itemKey));
      //     const profileName = recipe.profileName;
      //     // if (!items[profileName]) {
      //     //   items[profileName] = [];
      //     // }
      //     // items[profileName].push(recipe);
      //     items.push(recipe);
      //   }
      // }

      console.log("items", items);
      return items;
    };

    let profileList = await getAllProfiles();
    const profilerFile = "time-and-pressure.profiler.js";
    const profileLoader = await import(`../profiles/${profilerFile}`);
    const profileClass = profileLoader.default;
    console.log("profileClass", profileClass);

    let maxTime = 0;
    profileList = profileList
      .map((profileData) => {
        console.log("profileData", profileData);
        const previewData = profileClass.recipeToTimeSeriesData(profileData);
        const newProfileData = Object.assign(profileData, {
          previewData: previewData,
        });
        if (
          (previewData.length > 0) &
          (previewData[previewData.length - 1].t > maxTime)
        ) {
          maxTime = previewData[previewData.length - 1].t;
        }
        return newProfileData;
      })
      .sort((a, b) => {
        const nameA = a?.recipeName.toLowerCase();
        const nameB = b?.recipeName.toLowerCase();
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
  }, [storageContext]);

  const handleDeleteProfile = (profileData) => {};

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
              <Swipeable
                onSwipedLeft={(e) => {
                  console.log("swiped", i, e);
                  setSwipedProfileIndex(i);
                }}
                onSwiped={(e) => console.log("swiped", e)}
                key={`profile_${i}`}
              >
                <Box direction="row" justify="stretch">
                  <Box flex={true}>
                    <Button
                      style={{
                        display: "block",
                        height: "100%",
                      }}
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
                          <Chart
                            recipeData={data.previewData}
                            zoom="fit"
                            timeDomain={maxTimeDomain}
                          />
                        </Box>
                      </Box>
                    </Button>
                  </Box>
                  <Collapsible
                    open={swipedProfileIndex === i}
                    direction="horizontal"
                  >
                    <Box
                      background="red"
                      fill={true}
                      flex={true}
                      align="center"
                      alignContent="center"
                      pad="small"
                      justify="center"
                    >
                      <Button>Delete</Button>
                    </Box>
                  </Collapsible>
                </Box>
              </Swipeable>
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
