import { useState, useEffect, useRef } from "react";
import { Header, Box, Button, Grid } from "grommet";
import ComGndSymbol from "../svgs/com-gnd_logo_symbol.svg";

export default function AppHeader({children}) {
    
    return (
        <Header pad={{vertical: "small", horizontal: "medium"}}>
            <Button 
            plain
            gap="xxsmall"
            icon={
              <ComGndSymbol
                viewBox="0 0 32 32"
                style={{ color: "white", width: "24px", height: "24px" }}
              />}></Button>
              {children}
        </Header>
    )
};
