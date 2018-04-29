require("dotenv").config();
const express = require("express");
const redis = require("redis");
const Discord = require("discord.js");

const { getUserId, getEmojiReaction } = require("./discord-accessors");

const discordClient = new Discord.Client();
const redisClient = redis.createClient({ host: "redis" });
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

discordClient.on("messageReactionAdd", (reaction, user) => {
  const messageAuthorId = getUserId(reaction.message.author);
  const reactorUserId = getUserId(user);
  const emoji = getEmojiReaction(reaction);

  console.log(
    `Incrementing ${emoji} for ${messageAuthorId}, added by ${reactorUserId}`
  );
  redisClient.hincrby("emoji", emoji, 1);
  redisClient.hincrby(`user:${reactorUserId}`, emoji, 1);
  redisClient.hincrby(`emoji:${emoji}`, messageAuthorId, 1);
});

discordClient.on("messageReactionRemove", (reaction, user) => {
  const messageAuthorId = getUserId(reaction.message.author);
  const reactorUserId = getUserId(user);
  const emoji = getEmojiReaction(reaction);

  console.log(
    `Decrementing ${emoji} for ${messageAuthorId}, removed by ${reactorUserId}`
  );
  redisClient.hincrby("emoji", emoji, -1);
  redisClient.hincrby(`user:${reactorUserId}`, emoji, 1);
  redisClient.hincrby(`emoji:${emoji}`, messageAuthorId, -1);
});

discordClient.login(process.env.DISCORD_TOKEN);

app.get("/", (req, res) =>
  res.send({
    routes: ["/emojis", "/emojis/:emoji", "/reactions/:user"],
  })
);

app.get("/emojis", (req, res) => {
  redisClient.hgetall("emoji", (err, data) => {
    if (data === null) {
      res.send({});
      return;
    }
    res.send(data);
  });
});

app.get("/emojis/:emoji", (req, res) => {
  redisClient.hgetall(`emoji:${req.params.emoji}`, (err, data) => {
    if (data === null) {
      res.send({});
      return;
    }
    res.send(data);
  });
});

app.get("/reactions/:user", (req, res) => {
  redisClient.hgetall(`user:${req.params.user}`, (err, data) => {
    if (data === null) {
      res.status(404).send({
        error:
          "No reactions found. Did you request a username including # identifier? The # needs to be URI encoded, use %23.",
      });
      return;
    }
    res.send(data);
  });
});

app.listen(3000, "0.0.0.0", () =>
  console.log("Example app listening on port 3000!")
);
