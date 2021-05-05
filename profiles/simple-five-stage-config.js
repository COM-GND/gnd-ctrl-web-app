const pressureProfile = {
  profileName: "Simple Five Stage",
  profile: "time-and-pressue",
  profileFile: 'time-and-pressure-profile.js',
  stages: [
    {
      name: "Pre Infusion",
      time: {
        name: "Time",
        id: "pre-infusion-time",
        type: "time",
        min: 0,
        max: 20,
        defaultValue: 3,
        unit: "seconds",
        control: "slider",
      },
      pressure: {
        name: "Pressure",
        id: "pre-infusion-pressure",
        type: "pressure",
        min: 0,
        max: 10,
        defaultValue: 3,
        unit: "bars",
        control: "slider",
      },
    },
    {
      name: "Bloom",
      time: {
        name: "Time",
        defaultValue: 5,
        min: 0,
        max: 30,
        unit: "seconds",
        control: "slider",
      },
      pressure: {
        name: "Pressure",
        id: "bloom-pressure",
        type: "pressure",
        min: 0,
        max: 10,
        defaultValue: 3,
        unit: "bars",
        control: "slider",
      },
    },
    {
      name: "Ramp",
      time: {
        name: "Ramp-up Time",
        id: "pressure-ramp-up-time",
        type: "time",
        min: 0,
        max: 10,
        defaultValue: 5,
        unit: "seconds",
        control: "slider",
      },
      pressure: {
        name: "Pressure",
        id: "ramp-up-pressure",
        type: "pressure",
        min: 0,
        max: 10,
        defaultValue: 9,
        unit: "bars",
        control: "slider",
      },
    },
    {
      name: "Infusion",
      time: {
        name: "Time",
        id: "infusion-time",
        type: "time",
        min: 0,
        max: 60,
        defaultValue: 20,
        unit: "seconds",
        control: "slider",
      },
      pressure: {
        name: "Pressure",
        id: "infusion-pressure",
        type: "pressure",
        min: 0,
        max: 10,
        defaultValue: 8,
        unit: "bars",
        control: "slider",
      },
    },
  ],
};

export default pressureProfile;