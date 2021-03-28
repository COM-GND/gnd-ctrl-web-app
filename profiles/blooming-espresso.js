import profile from './profile';

export default class bloomingEspresso extends profile {
  constructor(recipe) {
    super(recipe);
    this.parameters = parameters;
    this.recipe = recipe ? recipe : this.getDefaultRecipe();
  }
}

const parameters = [
  {
    name: "Pre Infusion",
    time: {
      name: "Pre-infusion Time",
      id: "pre-infusion-time",
      type: "time",
      min: 0,
      max: 20,
      defaultValue: 7,
      unit: "seconds",
      control: "slider",
    },
    pressure: {
      name: "Pre-infusion Pressure",
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
      name: "Bloom Time",
      defaultValue: 5,
      min: 0,
      max: 5,
      unit: 'seconds',
      control: 'slider'
    },
  },
  {
    name: "Ramp",
    time: {
      name: "Pressure Ramp-up Time",
      id: "pressure-ramp-up-time",
      type: "time",
      min: 0,
      max: 10,
      defaultValue: 5,
      unit: "seconds",
      control: "slider",
    },
    pressure: {
      defaultValue: 9,
    },
  },
  {
    name: "Infusion",
    time: {
      name: "Infusion Time",
      id: "infusion-time",
      type: "time",
      min: 0,
      max: 60,
      defaultValue: 20,
      unit: "seconds",
      control: "slider",
    },
    pressure: {
      name: "Infusion Pressure",
      id: "infusion-pressure",
      type: "pressure",
      min: 0,
      max: 10,
      defaultValue: 8,
      unit: "bars",
      control: "slider",
    },
  },
];

