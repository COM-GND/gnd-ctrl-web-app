const configs = [];
const profilers = [];
// Import all of the configs inside of the Profiles directory
// https://webpack.js.org/guides/dependency-management/#require-context
function getDefaults(r) {
  console.log("r", r, r.id, r.keys());

  const defaultExports = [];

  r.keys().forEach((key) => {
    const defaultClass = r(key).default;
    const file = key.indexOf("./") === 0 ? key.substring(2) : key;
    defaultClass.configFile = file;
    defaultExports.push(defaultClass);
  });

  return defaultExports;
}

export default function importMultiple(type = "all") {
  //const test = require.context("../profiles/", false, /\.js$/);
  try {
    // note the regex passed her must be static for webpack to transpile
    // see: https://github.com/webpack/webpack/issues/4772
    if (type === "all") {
      const requireContext = require.context("../profiles", false, /\.js$/);
      const imported = getDefaults(requireContext);
      return imported;
    } else if (type === "config") {
      const requireContext = require.context(
        "../profiles",
        false,
        /config\.js$/
      );
      const imported = getDefaults(requireContext);
      return imported;
    } else if (type === "profiler") {
      const requireContext = require.context(
        "../profiles",
        false,
        /profiler\.js$/
      );
      const imported = getDefaults(requireContext);
      return imported;
    }
  } catch (error) {
    console.error(`Could not require "${type}" files`);
    return [];
  }
}
