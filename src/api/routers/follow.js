const { Router } = require("express");
const router = Router();
const Twitter = require("twitter");
const { TW_CONSUMER_KEY, TW_CONSUMER_SECRET } = process.env;

const genTwClient = req => {
  if (!req.session.oauth) {
    throw new Error("oauth is empty");
  }
  const { access_token, access_token_secret } = req.session.oauth;
  if (!access_token || !access_token_secret) {
    throw new Error("token is empty");
  }
  return new Twitter({
    consumer_key: TW_CONSUMER_KEY,
    consumer_secret: TW_CONSUMER_SECRET,
    access_token_key: access_token,
    access_token_secret: access_token_secret
  });
};

router.get("/followers", async (req, res) => {
  try {
    const client = genTwClient(req);
    const users = await client.get("followers/list", {
      screen_name: req.query.screen_name,
      cursor: req.query.cursor,
      count: 200
    });
    res.send(users);
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});
router.get("/follows", async (req, res) => {
  try {
    const client = genTwClient(req);
    const users = await client.get("friends/list", {
      screen_name: req.query.screen_name,
      cursor: req.query.cursor,
      count: 200
    });
    res.send(users);
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});
router.post("/unfollow", async (req, res) => {
  try {
    const client = genTwClient(req);
    const result = await client.post("friendships/destroy", {
      screen_name: req.body.screen_name
    });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

module.exports = router;
