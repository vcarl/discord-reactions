const getUserId = user => `${user.username}#${user.discriminator}`;

const getEmojiReaction = reaction => reaction._emoji.name;

module.exports = {
  getUserId,
  getEmojiReaction,
};
