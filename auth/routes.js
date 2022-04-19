const express = require("express");
const axios = require("axios");
require("dotenv").config();

const domain =
  process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : "https://" + process.env.HEROKU_APP_NAME + ".herokuapp.com";

const generateRandomString = (length) => {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

let spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
let spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;

let spotify_redirect_uri = domain + "/auth/callback";
console.log("Spotify redirect uri: " + spotify_redirect_uri);

const router = express.Router();

router.get("/login", (req, res, next) => {
  console.log("got login request");
  let scope = "streaming user-read-email user-read-private";
  let state = generateRandomString(16);
  let auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state,
    show_dialog: true,
  });

  res.redirect(
    "https://accounts.spotify.com/authorize/?" +
      auth_query_parameters.toString()
  );
});

router.get("/callback", (req, res) => {
  let code = req.query.code;

  const formData = new URLSearchParams({
    code: code,
    redirect_uri: spotify_redirect_uri,
    grant_type: "authorization_code",
  });

  axios
    .request({
      url: "https://accounts.spotify.com/api/token",
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(spotify_client_id + ":" + spotify_client_secret).toString(
            "base64"
          ),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: formData,
    })
    .then((response) => {
      if (response.status == "200") {
        let token = encodeURIComponent(response.data.access_token);
        let expiration = encodeURIComponent(
          Date.now() + response.data.expires_in * 1000
        );
        let refresh_token = encodeURIComponent(response.data.refresh_token);
        res
          .writeHead(301, {
            Location:
              `http://localhost:3000/?token=` +
              token +
              `&expires=` +
              expiration +
              `&refresh_token=` +
              refresh_token,
          })
          .end();
      }
    })
    .catch((error) => {
      console.log(error);
    });
});
/* 
router.get("/auth_token", (req, res) => {
  console.log("getting token");
  res.json({ access_token: access_token });
}); */

router.post("/new_token", (req, res) => {
  let formData = new URLSearchParams({
    refresh_token: req.body.refresh_token,
    grant_type: "refresh_token",
  });
  axios
    .request({
      url: "https://accounts.spotify.com/api/token",
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(spotify_client_id + ":" + spotify_client_secret).toString(
            "base64"
          ),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: formData,
    })
    .then((response) => {
      if (response.status == "200") {
        let token = encodeURIComponent(response.data.access_token);
        let expiration = encodeURIComponent(
          Date.now() + response.data.expires_in * 1000
        );
        let refresh_token = response.data.refresh_token
          ? encodeURIComponent(response.data.refresh_token)
          : null;
        res
          .writeHead(301, {
            Location:
              `http://localhost:3000/?token=` +
              token +
              `&expires=` +
              expiration +
              (refresh_token ? `&refresh_token=` + refresh_token : ""),
          })
          .end();
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

module.exports = router;
