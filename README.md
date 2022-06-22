# Mist

Discord bot for accessing steam using steamapi

[![Discord server invite](https://img.shields.io/discord/828964319764283412?style=for-the-badge)](https://discord.gg/MZhzgdbgsc)

[Slash command invite](https://discord.com/oauth2/authorize?client_id=826724857936609291&scope=applications.commands)

## Features

- Display Steam profiles
- Resole SteamID
- Showcase Steam profiles with screenshots
- Display internal Steam game stats for a given user
- Display Steam bans for a user
- Display current players for a Steam game
- Display Steam game's store page in a chat-friendly format

![Showcase video](showcase.gif)

# Selfhosting

## Registering slash commands

You need to do this, otherwise you won't have an option to interact with your instance

### For a single server

`node firstrun.js guild <type in the id of your guild>`

### Globally

`node firstrun.js global`

## How to run

0. Remember to check .env!
1. `npm i`
2. `node main.js` (If you can, screen is recommended)

## Common issues

### Failed to launch browser

`Something has gone wrong! Error: Failed to launch the browser process! spawn /usr/bin/chromium-browser ENOENT`

This is usually caused on linux distros (like archlinux) that have different naming of chromium than puppeteer expects.
Easy fix is to uncomment `PUPPETEER_EXECUTABLE_PATH` in .env and change it to `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` or different path of your installed browser.
