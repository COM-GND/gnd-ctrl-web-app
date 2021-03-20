const theme = {
  global: {
    font: {
      size: '14px',
    },
    focus: {
      outline: {
        color: {
          dark: "grey ",
          light: "whitesmoke"
        }
      }
    },
    edgeSize: {
      small: "8px", // the padding for an icon-only button
      medium: "16px",
      large: "24px"
    },
    breakpoints: {
      //https://grommet-nextjs.herokuapp.com/documentation/grommet/Box?theme=light
      small: {
        edgeSize: {
        }
      }
    }
  }
}

export {theme as default};