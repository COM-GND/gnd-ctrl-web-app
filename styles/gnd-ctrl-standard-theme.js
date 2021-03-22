const theme = {
  global: {
    colors: {
      "accent-1": "whitesmoke",
      "control": "white", // changes the button border color
      "brand": "whitesmoke",
      
    },
    
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
    },
  },
  button: {
    border: {
      color: "black",
      width: "0px",
      radius: "1px"
    },
    size: {
      small: {
        border: {
          radius: "1px"
        }
      },
      medium: {
        border: {
          radius: "1px"
        }
      },
      large: {
        border: {
          radius: "1px"
        }
      }
    }
  },
}

export {theme as default};