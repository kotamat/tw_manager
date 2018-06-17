const { Nuxt, Builder } = require("nuxt");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = require("express")();
const Oauth = require("oauth").OAuth;
const { TW_CONSUMER_KEY, TW_CONSUMER_SECRET } = process.env;
const nuxtConfig = require("../nuxt.config");

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

const oa = new Oauth(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  TW_CONSUMER_KEY,
  TW_CONSUMER_SECRET,
  "1.0A",
  null,
  "HMAC-SHA1"
);
// twitter login
app.get("/api/twitter", function(req, res) {
  oa.getOAuthRequestToken(function(
    error,
    oauthToken,
    oauthTokenSecret,
    results
  ) {
    if (error) {
      console.error(error);
      res.send("something wrong");
    }

    req.session.oauth = {
      token: oauthToken,
      token_secret: oauthTokenSecret
    };
    res.redirect(
      `https://twitter.com/oauth/authenticate?oauth_token=${oauthToken}`
    );
  });
});

app.get("/api/twitter/callback", function(req, res, next) {
  if (!req.session.oauth) {
    next(new Error("You're forbidden to access"));
  }
  req.session.oauth.verifier = req.query.oauth_verifier;
  const { oauth } = req.session;
  oa.getOAuthAccessToken(
    oauth.token,
    oauth.token_secret,
    oauth.verifier,
    function(error, access_token, access_token_secret, results) {
      if (error) {
        console.error(error);
        res.send("something wrong");
      }

      req.session.oauth = {
        ...req.session.oauth,
        access_token,
        access_token_secret
      };
      console.log(results);
      res.redirect("/");
    }
  );
});

// We instantiate Nuxt.js with the options
const isProd = process.env.NODE_ENV === "production";
const nuxt = new Nuxt(nuxtConfig);
// No build in production
if (!isProd) {
  const builder = new Builder(nuxt);
  builder.build();
}
app.use(nuxt.render);
app.listen(3000);
console.log("Server is listening on http://localhost:3000");
