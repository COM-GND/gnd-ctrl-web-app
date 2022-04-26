import dynamic from "next/dynamic";
import { useState, useEffect, useRef, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Box,
  Button,
  Grid,
  Text,
  Layer,
  Anchor,
  Collapsible,
  Heading,
} from "grommet";
import { useSwipeable } from "react-swipeable";
import Swipeable from "./swipeable";
// import useLocalStorage from "../hooks/use-local-storage";
import { StorageContext } from "../contexts/storage-context";
import importMultiple from "../utils/import-multiple";

import Chart from "../components/chart";
// import profile from "../profiles/time-and-pressure.profiler";

export default function ProfileBrowser({
  onAdd = () => {},
  onOpen = () => {},
}) {
  const [userProfilesData, setUserProfilesData] = useState();
  const [presetProfilesData, setPresetProfilesData] = useState();
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

  const maybeSetMaxTime = (time) => {
    setMaxTimeDomain((oldTime) => {
      const limitedTime = time > 60000 ? 60000 : 0;
      return limitedTime > oldTime ? limitedTime : oldTime;
    });
  };

  /**
   * Load Preset profiles recipe configs from /recipes/ dir
   */
  useEffect(async () => {
    const configs = importMultiple("config");
    const profilerImports = {};
    if (!configs) {
      return;
    }
    const newProfileDataPromises = configs.map(async (config) => {
      const configProfiler = config.profilerFile;
      let profileClass;
      if (profilerImports[config.profilerFile]) {
        profileClass = profilerImports[config.profilerFile];
      } else {
        const profileLoader = await import(
          `../profiles/${config.profilerFile}`
        );
        profileClass = profileLoader.default;
        profilerImports[config.profilerFile] = profileClass;
      }
      const previewData = profileClass.recipeToTimeSeriesData(config);
      maybeSetMaxTime(previewData[previewData.length - 1].t);
      const newConfig = Object.assign(config, {
        previewData: previewData,
        recipeType: "preset",
      });
      return newConfig;
    });

    const newProfileData = await Promise.all(newProfileDataPromises);
    setPresetProfilesData(newProfileData);
  }, []);

  /**
   * Load user recipes from local storage.
   */
  useEffect(async () => {
    const getAllProfiles = async () => {
      let items = [];
      await storageContext.store.forEach((value, key, index) => {
        console.log("found item", key);
        if (key.includes(":recipe") && value) {
          console.log("adding item", key);
          items.push(value);
        }
      });

      console.log("items", items);
      return items;
    };

    let profileList = await getAllProfiles();
    const profilerFile = "time-and-pressure.profiler.js";
    const profileLoader = await import(`../profiles/${profilerFile}`);
    const profileClass = profileLoader.default;
    console.log("profileClass", profileClass);

    let maxTime = 0;
    profileList = profileList.map((profileData) => {
      console.log("profileData", profileData);
      const previewData = profileClass.recipeToTimeSeriesData(profileData);
      const newProfileData = Object.assign(profileData, {
        previewData: previewData,
        recipeType: "user",
      });
      maybeSetMaxTime(previewData[previewData.length - 1].t);
      // if (
      //   (previewData.length > 0) &
      //   (previewData[previewData.length - 1].t > maxTime)
      // ) {
      //   maxTime = previewData[previewData.length - 1].t;
      // }
      return newProfileData;
    });
    // .sort((a, b) => {
    //   const nameA = a?.recipeName.toLowerCase();
    //   const nameB = b?.recipeName.toLowerCase();
    //   if (nameA < nameB) {
    //     return -1;
    //   }
    //   if (nameA > nameB) {
    //     return 1;
    //   }
    //   return 0;
    // });

    // For better comparison, we want all the charts to share the same time-domain
    //setMaxTimeDomain(maxTime);
    setUserProfilesData(profileList);
  }, [storageContext]);

  const renderProfilePreview = (data, i) => {
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
                    timeDomain={data.previewData[data.previewData.length - 1].t}
                  />
                </Box>
              </Box>
            </Button>
          </Box>
          <Collapsible open={swipedProfileIndex === i} direction="horizontal">
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
  };

  console.log("userProfilesData", userProfilesData);
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
        {userProfilesData &&
          userProfilesData.map((data, i) => {
            console.log("data", data);
            return <div key={`user_${i}`}>{renderProfilePreview(data, i)}</div>;
          })}
        <Button
          label="Add"
          onClick={() => {
            const newId = uuidv4();
            onAdd(newId);
          }}
        />
      </Grid>
      <Box flex="grow">
        <Box pad={{ horizontal: "medium" }}>
          <Heading level={3} size="small" margin={0}>
            Profile Presets
          </Heading>
        </Box>
        <Grid
          columns="small"
          rows="small"
          pad="medium"
          gap="xsmall"
          align="center"
          alignContent="center"
        >
          {presetProfilesData &&
            presetProfilesData.map((data, i) => {
              console.log("preset data", data);
              return (
                <div key={`preset_${i}`}>{renderProfilePreview(data)}</div>
              );
            })}
        </Grid>
      </Box>
    </Box>
  );
}
