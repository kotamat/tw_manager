const { Nuxt, Builder } = require("nuxt");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = require("express")();
const nuxtConfig = require("../../nuxt.config");
const path = require("path");
const chokidar = require("chokidar");

const auth = require("./routers/auth");
const follow = require("./routers/follow");

// Body parser, to access `req.body`
app.use(bodyParser.json());

// Sessions to create `req.session`
app.use(
  session({
    secret: "3u83jlfeahr3q43yp8qrewaji3",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
  })
);

app.use("/api/auth", auth);
app.use("/api/follow", follow);

// We instantiate Nuxt.js with the options
const isProd = process.env.NODE_ENV === "production";
const nuxt = new Nuxt(nuxtConfig);
// No build in production
if (!isProd) {
  const builder = new Builder(nuxt);
  builder.build();

  // // hot reloading
  // // const expressPath = path.join(nuxtConfig.srcDir, "api");
  // const watcher = chokidar.watch("../api").on("change", path => {
  //   const keys = Object.keys(require.cache).filter(k => k.includes("api/"));
  //   keys.forEach(k => delete require.cache[k]);
  // });

  // nuxt.hook("close", () => {
  //   watcher.close();
  // });
}
app.use(nuxt.render);
app.listen(3000);
console.log("Server is listening on http://localhost:3000");
