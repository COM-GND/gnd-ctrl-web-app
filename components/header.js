import { useState, useEffect, useRef } from "react";
import { Header, Box, Button, Grid, Text } from "grommet";
import ComGndSymbol from "../svgs/com-gnd_logo_symbol.svg";

export default function AppHeader({
  children,
  onClickHome = () => {},
  heading = "",
}) {
  return (
    <Header pad={{ vertical: "small", horizontal: "medium" }}>
      <Box direction="row" gap="medium">
        <Button
          plain
          gap="xxsmall"
          onClick={onClickHome}
          icon={
            <ComGndSymbol
              viewBox="0 0 32 32"
              style={{ color: "white", width: "24px", height: "24px" }}
            />
          }
        ></Button>
        <Text truncate={true}>{heading}</Text>
      </Box>
      {children}
    </Header>
  );
}
