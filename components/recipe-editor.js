import React, { useState, useEffect, useRef, useContext } from "react";
import { Box, Select, Text, Heading, RangeInput, TextInput } from "grommet";
import { v4 as uuidv4 } from "uuid";

import { StorageContext } from "../contexts/storage-context";
import importMultiple from "../utils/import-multiple";
import RecipeEditorStage from "./recipe-editor-stage";

// NOTE: Using localStorage for easier migration to expo if a native app is ever attempted
// Expo / React Native uses localStorage for web support of AsyncStorage api
// localForage could be a compromise if localStorage becomes a performance issue
// import useLocalStorage from "../hooks/use-local-storage";

function RecipeEditor({ defaultProfileConfig, onChange, recipeId }) {
  // console.log("RecipeEditor", XXdefaultProfileConfig);

  const [profileType, setProfileType] = useState(
    recipeId ? "recipe" : "preset"
  );

  // if the recipe Id exists, use that for the local storage key, otherwise, create a new one.
  const [storageId, setStorageId] = useState(recipeId ? recipeId : uuidv4());

  // let defaultConfig;
  // const recipeConfigFoundInProfiles = configs.find(
  //   (config) => config.configFile === defaultProfileConfig?.configFile
  // );
  // if (recipeConfigFoundInProfiles) {
  //   defaultConfig = recipeConfigFoundInProfiles;
  // } else {
  //   defaultConfig = recipeData;
  // }

  const localStorageKey = `${storageId}:recipe`;

  const defaultRecipeProperties = {
    id: storageId,
    recipeName: "Untitled recipe",
    created: new Date(),
    modified: new Date(),
  };

  const storageContext = useContext(StorageContext);

  const [configs, setConfigs] = useState([]);

  const defaultRecipe = Object.assign(
    defaultRecipeProperties,
    defaultProfileConfig
  );

  // const [recipeData, _setRecipeData] = useLocalStorage(
  //   localStorageKey,
  //   Object.assign(defaultRecipeProperties, defaultProfileConfig)
  // );

  const recipeData = storageContext.getValue(localStorageKey) || defaultRecipe;

  const recipeDataRef = useRef(recipeData);

  const setRecipeData = (recipeData) => {
    recipeDataRef.current = recipeData;
    storageContext.setValue(localStorageKey, recipeData);
    //_setRecipeData(recipeData);
  };

  useEffect(() => {
    const newConfigs = importMultiple("config");
    setConfigs(newConfigs);
    onChange(recipeData);
  }, []);

  const handleRecipeNameChange = (e) => {
    const newName = e.target.value;
    const newRecipeData = Object.assign({}, recipeDataRef.current);
    newRecipeData.recipeName = newName;
    newRecipeData.modified = new Date();
    setRecipeData(newRecipeData);
    onChange(newRecipeData);
  };

  const handleProfileConfigChange = ({ value, option }) => {
    console.log("handleProfileConfigChange", value, option);
    const newRecipeData = Object.assign({}, value);
    newRecipeData.recipeName = recipeDataRef.current.recipeName;
    newRecipeData.id = recipeDataRef.current.id;
    newRecipeData.created = recipeDataRef.created;
    newRecipeData.modified = new Date();
    setRecipeData(newRecipeData);
    onChange(newRecipeData);
  };

  const setStageParamValue = (stageNum, paramKey, value) => {
    const newRecipeData = Object.assign({}, recipeDataRef.current);
    newRecipeData.modified = new Date();
    //const newRecipeStages = recipeDataRef.current.stage.slice();

    if (stageNum === "setup") {
      newRecipeData.setup[paramKey].value = value;
    } else {
      newRecipeData.stages[stageNum][paramKey].value = value;
    }

    //setRecipeStages(newRecipeStages);
    //const newRecipeData = Object.assign({}, recipeData);
    //newRecipeData.stages = newRecipeStages;
    console.log("setStageParamValue", newRecipeData);
    setRecipeData(newRecipeData);
    //const newRecipe = recipeParamsToRecipe(newRecipeStages);
    onChange(newRecipeData);
  };

  const getStageParamValue = (stageNum, paramKey) => {
    if (!recipeDataRef.current) {
      return;
    }

    const profileStages =
      stageNum === "setup"
        ? recipeDataRef.current
        : recipeDataRef.current.stages;

    if (!profileStages[stageNum]) {
      console.error(`Stage ${stageNum} does not exist in profile.`);
      return;
    }

    if (!profileStages[stageNum][paramKey]) {
      console.error(
        `Parameter ${paramKey} does not exist in stage ${stageNum}.`
      );
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
        {recipeData && recipeData.profileName}
      </Heading>
      <Box pad={{ vertical: "medium" }}>
        <TextInput
          onChange={handleRecipeNameChange}
          placeholder="Recipe name"
          value={recipeData?.recipeName}
          onFocus={(e) => {
            if (e.target.value == "Untitled Recipe") {
              e.target.select();
            }
          }}
        ></TextInput>
      </Box>
      {recipeData && recipeData.setup && (
        <RecipeEditorStage
          stageData={recipeData.setup}
          stageIndex={"setup"}
          getStageParamValue={getStageParamValue}
          setStageParamValue={setStageParamValue}
        />
      )}
      {recipeData &&
        recipeData.stages.map((stage, i) => (
          <RecipeEditorStage
            key={`profile_stage_${i}`}
            stageData={stage}
            stageIndex={i}
            getStageParamValue={getStageParamValue}
            setStageParamValue={setStageParamValue}
          />
        ))}
    </Box>
  );
}

export default React.memo(RecipeEditor);
