require("dotenv").config();
const express = require("express");
const Discord = require("discord.js");

const discordClient = new Discord.Client();
const app = express();

discordClient.on("ready", () => {
  console.log(`Logged in as ${discordClient.user.tag}!`);
});

discordClient.login(process.env.DISCORD_TOKEN);

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(3000, "0.0.0.0", () =>
  console.log("Example app listening on port 3000!")
);
