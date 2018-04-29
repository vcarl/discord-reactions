require("dotenv").config();
const express = require("express");
const Discord = require("discord.js");

const discordClient = new Discord.Client();
const app = express();

discordClient.on("ready", () => {
  console.log(`Logged in as ${discordClient.user.tag}!`);
});

if (process.env.NODE_ENV !== "production") {
  // This is a hack to emit `messageReactionAdd` events for messages that were
  // sent before the server was started. It adds a good bit of overhead for an
  // edge case that shouldn't apply in general in production.
  // https://gist.github.com/Danktuary/27b3cef7ef6c42e2d3f5aff4779db8ba#file-index-js
  discordClient.on("raw", async event => {
    if (event.t !== "MESSAGE_REACTION_ADD") return;

    const { d: data } = event;
    const user = discordClient.users.get(data.user_id);
    const channel =
      discordClient.channels.get(data.channel_id) || (await user.createDM());

    // if the message is already in the cache, don't re-emit the event
    if (channel.messages.has(data.message_id)) return;

    const message = await channel.fetchMessage(data.message_id);
    const emojiKey = data.emoji.id
      ? `${data.emoji.name}:${data.emoji.id}`
      : data.emoji.name;
    const reaction = message.reactions.get(emojiKey);

    discordClient.emit("messageReactionAdd", reaction, user);
  });
}

discordClient.login(process.env.DISCORD_TOKEN);

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(3000, "0.0.0.0", () =>
  console.log("Example app listening on port 3000!")
);
