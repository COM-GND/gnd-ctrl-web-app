var https = require("https");
var fs = require("fs");
const { parse } = require("url");

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

var options = {
  key: fs.readFileSync("./localhost+5-key.pem"),
  cert: fs.readFileSync("./localhost+5.pem"),
  ca: [fs.readFileSync('~/Library/Application Support/mkcert/rootCA.pem')]
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
