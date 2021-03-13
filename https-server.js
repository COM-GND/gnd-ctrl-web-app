var https = require("https");
var fs = require("fs");
var path = require("path");
const { parse } = require("url");
const { execSync } = require("child_process");

console.log("server.js ", __dirname);
const next = require("next");
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";

console.log(
  "Starting HTTPS server ",
  dev ? " - dev " : " - production ",
  " with dir: ",
  __dirname
);

const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

// Locate the path to the root CA generated by mkcert
let rootCAPath = execSync("mkcert -CAROOT").toString();
rootCAPath = rootCAPath.replace(/(\r\n|\n|\r)/gm, "");
rootCAPath = path.join(rootCAPath, 'rootCA.pem');
console.log('Your Root Certificate is located at: ', rootCAPath);
console.log('Make sure the certificate is installed on your iOS device. See https://matthewhoelter.com/2019/10/21/how-to-setup-https-on-your-local-development-environment-localhost-in-minutes.html');

var options = {
  key: fs.readFileSync("./localhost+5-key.pem"),
  cert: fs.readFileSync("./localhost+5.pem"),
  ca: [fs.readFileSync(rootCAPath)],
};

app.prepare().then(() => {
  https
    .createServer(options, (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })
    .listen({ port: port }, (err) => {
      if (err) throw err;
      console.log(`> Https Ready on https://gnd-ctrl.test:${port}`);
    });
});
