import { useState, useEffect, useRef } from "react";
import { Box, Button, Text, Heading, RangeInput } from "grommet";
export default function RecipeEditor({ profile }) {
  console.log("RecipeEditor", profile);
  const profileParams = profile.parameters.slice();
  const [recipeParams, setRecipeParams] = useState(profileParams);

  const setStageParamValue = (stageNum, paramKey, value) => {
    const newRecipeParams = recipeParams.slice();
    newRecipeParams[stageNum][paramKey].value = value;
    setRecipeParams(newRecipeParams);
  };

  const getStageParamValue = (stageNum, paramKey) => {
    return profileParams[stageNum][paramKey].value
      ? profileParams[stageNum][paramKey].value
      : profileParams[stageNum][paramKey].defaultValue;
  };

  return (
    <Box className="recipe-editor" pad="small" overflow={{ vertical: "auto" }} flex={false}>
      <Heading level={3} size="small">
        Recipe Editor
      </Heading>
      {recipeParams.map((stage, i) => (
        <Box key={`profile_stage_${i}`} flex={false} border="top" pad={{vertical: "small"}}>
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
                  pad={{vertical: "small"}}
                  flex={false}
                >
                  <Text size="small">
                    {val.name}
                  </Text>
                  {val.control === "slider" && (
                    <Box direction="row" alignContent="center" flex={false}>
                      <Box pad="xsmall">{val.min}</Box>
                      <Box>
                        <RangeInput
                          min={val.min}
                          max={val.max}
                          value={getStageParamValue(i, key)}
                          onChange={(e) =>
                            setStageParamValue(i, key, e.target.value)
                          }
                        />
                      </Box>
                      <Box pad="xsmall">{val.max}</Box>
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
