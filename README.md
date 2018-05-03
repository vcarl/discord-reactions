# Discord Reactions

This is a discord bot that keeps track of reactions given to other users, and how many a user receives. It was built for Reactiflux, and currently exists only as an API. It's available at http://reactions.vcarl.com/.

`/emojis` returns a count of all emojis that have been reacted with for as long as the server has been running, in descending order of how many times they were used.

`/emojis/:emoji` will return who a list of users who have been reacted with that emoji, and how many times they were.

Some good emojis are:

* http://reactions.vcarl.com/emojis/%F0%9F%92%AF
* http://reactions.vcarl.com/emojis/%F0%9F%91%8D
* http://reactions.vcarl.com/emojis/%F0%9F%91%8C

`/reactions/:userid` will tell you how many times that user has reacted with each emoji. The user ID must include the #0000 number that comes after their username and must be URI encoded.

# Contributing

We need a website! There's a super spiffy http://jobs.reactiflux.com/ that @BTMPL made that I'd love to imitate.
