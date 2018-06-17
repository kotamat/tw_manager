const Oauth = require("oauth").OAuth;
const { TW_CONSUMER_KEY, TW_CONSUMER_SECRET } = process.env;
const { Router } = require("express");
const router = Router();

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
router.get("/twitter", (req, res) => {
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

router.get("/twitter/callback", (req, res, next) => {
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

module.exports = router;
