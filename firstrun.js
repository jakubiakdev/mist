/* eslint-disable require-jsdoc */
/*
This script is literally made out of cardboard, shit and duct tape
and needs to be rewritten ASAP
*/
// this is helpful https://rauf.wtf/slash/
const fetch = require('node-fetch');
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
require('dotenv').config();

const commands = [
  {
    'name': 'profile',
    'description': 'Shows information about a steam profile',
    'options': [
      {
        'type': 3,
        'name': 'URL',
        'description': 'Type in a URL of the profile (can be a steamID too!)',
        'default': false,
        'required': true,
      },
    ],
  },
  {
    'name': 'steamid',
    'options': [
      {
        'type': 3,
        'name': 'url',
        'description': 'Type in a URL of the profile',
        'default': false,
        'required': true,
      },
    ],
    'description': 'Gives the steamID of the profile',
  },
  {
    'name': 'showcase',
    'description': 'Generates a profile showcase (screenshot) of a profile',
    'options': [
      {
        'type': 3,
        'name': 'URL',
        'description': 'Type in a URL of the profile (can be a steamID too!)',
        'default': false,
        'required': true,
      },
    ],
  },
  {
    'name': 'gamestats',
    'description': 'Displays users game stats',
    'options': [
      {
        'type': 3,
        'name': 'URL',
        'description': 'Type in a URL of the profile (can be a steamID too!)',
        'default': false,
        'required': true,
      },
      {
        'type': 4,
        'name': 'GameID',
        'description': 'Type in a game id (from store page)',
        'default': false,
        'required': true,
      },
    ],
  },
  {
    'name': 'bans',
    'description': 'Display user\'s game and vac bans',
    'options': [
      {
        'type': 3,
        'name': 'URL',
        'description': 'Type in a URL of the profile (can be a steamID too!)',
        'default': false,
        'required': true,
      },
    ],
  },
  {
    'name': 'playercount',
    'description': 'Gives number of people playing a game',
    'options': [
      {
        'type': 4,
        'name': 'GameID',
        'description': 'Type in a game id (from store page)',
        'default': false,
        'required': true,
      },
    ],
  },
  {
    'name': 'game',
    'description': 'Show game\'s details',
    'options': [
      {
        'type': 4,
        'name': 'GameID',
        'description': 'Type in a game id (from store page)',
        'default': false,
        'required': false,
      },
    ],
  },
];
async function main() {
  const args = process.argv.slice(2);
  let apiEndpoint;
  switch (args[0]) {
    case 'global':
      apiEndpoint = `https://discord.com/api/v8/applications/${client.user.id}/commands`;
      break;
    case 'guild':
      apiEndpoint = `https://discord.com/api/v8/applications/${client.user.id}/guilds/${args[1]}/commands`;
      break;
    default:
      console.log('Proper use case: \n firstrun.js guild <id of your guild> \n or \n firstrun.js global');
      process.exit();
  }
  console.log(apiEndpoint);
  commands.forEach((command) => {
    (async () => {
      const response = await fetch(apiEndpoint, {
        method: 'post',
        body: command,
        headers: {
          'Authorization': 'Bot ' + config.token,
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      console.log(json);
    })();
  });
  process.exit();
}


client.on('ready', () => {
  console.log('Mist - firstrun program');
  console.log(`Logged in as a bot: ${client.user.tag}`);
  client.user.setPresence({activity: {type: `LISTENING`, name: `SETTING UP!`}, status: `dnd`}); // status
  main();
});
client.login();// logging in
