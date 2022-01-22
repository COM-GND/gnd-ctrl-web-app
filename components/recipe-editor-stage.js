import { Box, Select, Text, Heading, RangeInput, TextInput } from "grommet";

export default function RecipeEditorStage({
  stageData,
  stageIndex,
  getStageParamValue,
  setStageParamValue,
}) {
  if (!stageData) {
    return null;
  }
  return (
    <Box flex={false} border="top" pad={{ vertical: "small" }}>
      {Object.entries(stageData).map(([key, val], j) => {
        if (key === "name") {
          return (
            <Text size="small" key={`profile_param_name${j}`}>
              {val}
            </Text>
          );
        } else if (key !== "id") {
          return (
            <Box
              key={`profile_param_${j}`}
              pad={{ vertical: "small" }}
              flex={false}
              className="recipe-editor-stage__control-box"
            >
              <Text size="small" className="recipe-editor-stage__control-name">
                {val.name}: {getStageParamValue(stageIndex, key)} {val.unit}
              </Text>
              {val.control === "slider" && (
                <Box direction="row" align="center" flex={false} gap="xxsmall">
                  <Box flex={false} justify="end">
                    <Text size="xsmall">{val.min}</Text>
                  </Box>
                  <Box pad="small" justify="center" flex="grow">
                    <RangeInput
                      min={val.min}
                      max={val.max}
                      style={{ margin: "0" }}
                      step={0.1}
                      value={getStageParamValue(stageIndex, key)}
                      onChange={(e) => {
                        console.log(
                          "editor change",
                          stageIndex,
                          key,
                          e.target.value
                        );
                        setStageParamValue(
                          stageIndex,
                          key,
                          Number(e.target.value)
                        );
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
  );
}
