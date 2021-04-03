import { useState, useEffect, useRef } from "react";
import { Box, Button, Text, Heading, RangeInput, TextInput } from "grommet";
import { v4 as uuidv4 } from "uuid";

// NOTE: Using localStorge for easier migration to expo if a native app is ever attempted
// Expo / React Native uses localStorage for web support of AsyncStorage api
// localForage could be a compromise if localStorage becomes a performance issue
import useLocalStorage from "../hooks/use-local-storage";

export default function RecipeEditor({ profileConfig, onChange, recipeId }) {
  console.log("RecipeEditor", profileConfig);

  const localStorageKey = recipeId
    ? `recipe:${recipeId}`
    : `recipe:${uuidv4()}`;
  const [recipeName, setRecipeName] = useState("");

  const defaultRecipeProperties = {
    id: localStorageKey,
    recipeName: "Untitled recipe",
    created: new Date(),
    modified: new Date(),
  };

  const defaultRecipe = Object.assign(defaultRecipeProperties, profileConfig);

  const [recipeData, setRecipeData] = useLocalStorage(
    localStorageKey,
    defaultRecipe
  );

  const profileStages = recipeData.stages.slice();
  const [recipeStages, setRecipeStages] = useState(profileStages);

  const saveRecipe = (recipeData) => {
    const newRecipeData = Object.assign({}, recipeData);
    setRecipeData(newRecipeData);
  };

  const handleRecipeNameChange = (e) => {
    const newName = e.target.value;
    const newRecipeData = Object.assign({}, recipeData);
    newRecipeData.recipeName = newName;
    setRecipeData(newRecipeData);
  };

  const setStageParamValue = (stageNum, paramKey, value) => {
    const newRecipeStages = recipeStages.slice();
    newRecipeStages[stageNum][paramKey].value = value;
    setRecipeStages(newRecipeStages);
    const newRecipeData = Object.assign({}, recipeData);
    newRecipeData.stages = newRecipeStages;
    setRecipeData(newRecipeData);
    //const newRecipe = recipeParamsToRecipe(newRecipeStages);
    onChange(newRecipeStages);
  };

  const getStageParamValue = (stageNum, paramKey) => {
    return profileStages[stageNum][paramKey].value !== undefined
      ? profileStages[stageNum][paramKey].value
      : profileStages[stageNum][paramKey].defaultValue;
  };

  // const recipeParamsToRecipe = (params) => {
  //   const recipe = params.map((stage, i) => {
  //     const recipeStage = {
  //       time: { value: stage.time.value || stage.time.defaultValue },
  //     };
  //     if (stage?.pressure) {
  //       recipeStage.pressure = {};
  //       recipeStage.pressure.value = stage.pressure.defaultValue;
  //     }
  //     return recipeStage;
  //   });
  //   return recipe;
  // };

  return (
    <Box className="recipe-editor" pad="medium" flex={false}>
      <Heading level={3} size="small" margin={{ vertical: "xsmall" }}>
        Recipe Editor
      </Heading>
      <Heading level={4} size="small" margin={{ vertical: "xsmall" }} color={{dark: "light-1"}}>
        {recipeData.profileName}
      </Heading>
      <Box pad={{ vertical: "medium" }}>
        <TextInput
          onChange={handleRecipeNameChange}
          placeholder="Recipe name"
          value={recipeData.recipeName}
        ></TextInput>
      </Box>
      {recipeStages.map((stage, i) => (
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
