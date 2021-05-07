import { useState, useEffect, useRef } from "react";
import { Box, Select, Text, Heading, RangeInput, TextInput } from "grommet";
import { v4 as uuidv4 } from "uuid";

// NOTE: Using localStorge for easier migration to expo if a native app is ever attempted
// Expo / React Native uses localStorage for web support of AsyncStorage api
// localForage could be a compromise if localStorage becomes a performance issue
import useLocalStorage from "../hooks/use-local-storage";

const configs = [];
const profilers = [];
// Import all of the configs inside of the Profiles directory
// https://webpack.js.org/guides/dependency-management/#require-context
function importAll(r) {
  console.log("r", r, r.id, r.keys());

  return r.keys().forEach((key) => {
    if (key.includes("config.js")) {
      const data = r(key).default;
      data.configFile = key;
      configs.push(data);
    } else if (key.includes("profiler.js")) {
      const profilerClass = r(key).default;
      profilers.push(profilerClass);
    }
  });
}

importAll(require.context("../profiles/", false, /\.js$/));
console.log("all configs", configs);

export default function RecipeEditor({ defaultProfileConfig, onChange, recipeId }) {
  console.log("RecipeEditor", defaultProfileConfig);

  // let defaultConfig;
  // const recipeConfigFoundInProfiles = configs.find(
  //   (config) => config.configFile === defaultProfileConfig?.configFile
  // );
  // if (recipeConfigFoundInProfiles) {
  //   defaultConfig = recipeConfigFoundInProfiles;
  // } else {
  //   defaultConfig = recipeData;
  // }

  const localStorageKey = `${recipeId}:recipe`;

  const defaultRecipeProperties = {
    id: recipeId,
    recipeName: "Untitled recipe",
    created: new Date(),
    modified: new Date(),
  };

  //const defaultRecipe = Object.assign(defaultRecipeProperties, defaultProfileConfig);

  const [recipeData, _setRecipeData] = useLocalStorage(
    localStorageKey,
    Object.assign(defaultRecipeProperties, defaultProfileConfig)
  );

  const recipeDataRef = useRef(recipeData);

  const setRecipeData = (recipeData) => {
    recipeDataRef.current = recipeData;
    _setRecipeData(recipeData);
  }

  useEffect(() => {
    console.log("edit first load");
    onChange(recipeData);
  }, []);

  const handleRecipeNameChange = (e) => {
    const newName = e.target.value;
    const newRecipeData = Object.assign({}, recipeDataRef.current);
    newRecipeData.recipeName = newName;
    setRecipeData(newRecipeData);
    onChange(newRecipeData);
  };

  const handleProfileConfigChange = ({ value, option }) => {
    console.log("handleProfileConfigChange", value, option);
    const newRecipeData = Object.assign({}, value);
    newRecipeData.recipeName = recipeDataRef.current.recipeName;
    newRecipeData.id = recipeDataRef.current.id;
    setRecipeData(newRecipeData);
    onChange(newRecipeData);
  };

  const setStageParamValue = (stageNum, paramKey, value) => {
    const newRecipeData = Object.assign({}, recipeDataRef.current);
    //const newRecipeStages = recipeDataRef.current.stage.slice();
    newRecipeData.stages[stageNum][paramKey].value = value;
    //setRecipeStages(newRecipeStages);
    //const newRecipeData = Object.assign({}, recipeData);
    //newRecipeData.stages = newRecipeStages;
    console.log('setStageParamValue', newRecipeData);
    setRecipeData(newRecipeData);
    //const newRecipe = recipeParamsToRecipe(newRecipeStages);
    onChange(newRecipeData);
  };

  const getStageParamValue = (stageNum, paramKey) => {
    if(!recipeDataRef.current) {
      return;
    }
  
    const profileStages = recipeDataRef.current.stages;
    if(!profileStages[stageNum]) {
      console.error(`Stage ${stageNum} does not exist in profile.`);
      return;
    }

    if(!profileStages[stageNum][paramKey]) {
      console.error(`Parameter ${paramKey} does not exist in stage ${stageNum}.`);
      return;
    }
    return profileStages[stageNum][paramKey].value !== undefined
      ? profileStages[stageNum][paramKey].value
      : profileStages[stageNum][paramKey].defaultValue;
  };

  return (
    <Box className="recipe-editor" pad="medium" flex={false}>
      <Heading level={3} size="small" margin={{ vertical: "xsmall" }}>
        Recipe Editor
      </Heading>
      <Select
        options={configs}
        labelKey="profileName"
        valueKey="configFile"
        value={recipeData}
        onChange={handleProfileConfigChange}
      />
      <Heading
        level={4}
        size="small"
        margin={{ vertical: "xsmall" }}
        color={{ dark: "light-1" }}
      >
        {recipeData.profileName}
      </Heading>
      <Box pad={{ vertical: "medium" }}>
        <TextInput
          onChange={handleRecipeNameChange}
          placeholder="Recipe name"
          value={recipeData.recipeName}
        ></TextInput>
      </Box>
      {recipeData.stages.map((stage, i) => (
        <Box
          key={`profile_stage_${i}`}
          flex={false}
          border="top"
          pad={{ vertical: "small" }}
        >
          {Object.entries(stage).map(([key, val], j) => {
            if (key === "name") {
              return (
                <Text size="small" key={`profile_param_${j}`}>
                  {val}
                </Text>
              );
            } else {
              return (
                <Box
                  key={`profile_param_${j}`}
                  pad={{ vertical: "small" }}
                  flex={false}
                >
                  <Text size="small">
                    {val.name}: {getStageParamValue(i, key)} {val.unit}
                  </Text>
                  {val.control === "slider" && (
                    <Box
                      direction="row"
                      align="center"
                      flex={false}
                      gap="xxsmall"
                    >
                      <Box flex={false} justify="end">
                        <Text size="xsmall">{val.min}</Text>
                      </Box>
                      <Box pad="small" justify="center" flex="grow">
                        <RangeInput
                          min={val.min}
                          max={val.max}
                          style={{ margin: "0" }}
                          step={0.1}
                          value={getStageParamValue(i, key)}
                          onChange={(e) => {
                            console.log(
                              "editor change",
                              i,
                              key,
                              e.target.value
                            );
                            setStageParamValue(i, key, Number(e.target.value));
                          }}
                        />
                      </Box>
                      <Box flex={false}>
                        {" "}
                        <Text size="xsmall">{val.max}</Text>
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            }
          })}
        </Box>
      ))}
    </Box>
  );
}
