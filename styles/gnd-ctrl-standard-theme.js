const theme = {
  global: {
    colors: {
      "accent-1": "whitesmoke",
      "control": "white", // changes the button border color
      "brand": "whitesmoke",
    },
    spacing: "20px", // effects the size of the slider thumb
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
  heading: {
    level: {
      "1": {
        "font": {},
        "small": {
          "size": "34px",
          "height": "40px",
          "maxWidth": "816px"
        },
        "medium": {
          "size": "50px",
          "height": "56px",
          "maxWidth": "1200px"
        },
        "large": {
          "size": "82px",
          "height": "88px",
          "maxWidth": "1968px"
        },
        "xlarge": {
          "size": "114px",
          "height": "120px",
          "maxWidth": "2736px"
        }
      },
      "2": {
        "font": {},
        "small": {
          "size": "26px",
          "height": "32px",
          "maxWidth": "624px"
        },
        "medium": {
          "size": "34px",
          "height": "40px",
          "maxWidth": "816px"
        },
        "large": {
          "size": "50px",
          "height": "56px",
          "maxWidth": "1200px"
        },
        "xlarge": {
          "size": "66px",
          "height": "72px",
          "maxWidth": "1584px"
        }
      },
      "3": {
        "font": {},
        "small": {
          "size": "16px",
          "height": "1.25em",
          "maxWidth": "528px"
        },
        "medium": {
          "size": "26px",
          "height": "32px",
          "maxWidth": "624px"
        },
        "large": {
          "size": "34px",
          "height": "40px",
          "maxWidth": "816px"
        },
        "xlarge": {
          "size": "42px",
          "height": "48px",
          "maxWidth": "1008px"
        }
      },
      "4": {
        "font": {},
        "small": {
          "size": "16px",
          "height": "1.25em",
          "maxWidth": "432px"
        },
        "medium": {
          "size": "18px",
          "height": "24px",
          "maxWidth": "432px"
        },
        "large": {
          "size": "18px",
          "height": "24px",
          "maxWidth": "432px"
        },
        "xlarge": {
          "size": "18px",
          "height": "24px",
          "maxWidth": "432px"
        }
      },
      "5": {
        "font": {},
        "small": {
          "size": "16px",
          "height": "22px",
          "maxWidth": "384px"
        },
        "medium": {
          "size": "16px",
          "height": "22px",
          "maxWidth": "384px"
        },
        "large": {
          "size": "16px",
          "height": "22px",
          "maxWidth": "384px"
        },
        "xlarge": {
          "size": "16px",
          "height": "22px",
          "maxWidth": "384px"
        }
      },
      "6": {
        "font": {},
        "small": {
          "size": "14px",
          "height": "20px",
          "maxWidth": "336px"
        },
        "medium": {
          "size": "14px",
          "height": "20px",
          "maxWidth": "336px"
        },
        "large": {
          "size": "14px",
          "height": "20px",
          "maxWidth": "336px"
        },
        "xlarge": {
          "size": "14px",
          "height": "20px",
          "maxWidth": "336px"
        }
      }
    }
  },
  rangeInput: {
    track: {
      extend: {
        "border-radius": '4px'
      },
      lower: {

      },
      upper: {
        opacity: .5
      }
    
    }
  }
}

export {theme as default};