import { useState, useEffect, useRef } from "react";
import { Box, Button, Text, Heading, RangeInput } from "grommet";
export default function RecipeEditor({ profile, onChange }) {
  console.log("RecipeEditor", profile);
  const profileStages = profile.stages.slice();
  const [recipeParams, setRecipeParams] = useState(profileStages);

  const setStageParamValue = (stageNum, paramKey, value) => {
    const newRecipeParams = recipeParams.slice();
    newRecipeParams[stageNum][paramKey].value = value;
    setRecipeParams(newRecipeParams);
    //const newRecipe = recipeParamsToRecipe(newRecipeParams);
    onChange(newRecipeParams);
  };

  const getStageParamValue = (stageNum, paramKey) => {
    return profileStages[stageNum][paramKey].value
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
    <Box
      className="recipe-editor"
      pad="small"
      overflow={{ vertical: "auto" }}
      flex={false}
    >
      <Heading level={3} size="small">
        Recipe Editor
      </Heading>
      {recipeParams.map((stage, i) => (
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
                  <Text size="small">{val.name}</Text>
                  {val.control === "slider" && (
                    <Box
                      direction="row"
                      align="center"
                      flex={false}
                      gap="xxsmall"
                    >
                      <Box flex={false} justify="end">
                        {val.min}
                      </Box>
                      <Box pad="small" justify="center">
                        <RangeInput
                          min={val.min}
                          max={val.max}
                          step={.1}
                          value={getStageParamValue(i, key)}
                          onChange={(e) => {
                            console.log("editor change", i, key);
                            setStageParamValue(i, key, Number(e.target.value));
                          }}
                        />
                      </Box>
                      <Box flex={false}>{val.max}</Box>
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
