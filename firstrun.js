/*
This script is literally made out of cardboard, shit and duct tape
and needs to be rewritten ASAP
*/
const fetch = require('node-fetch');
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

const commands = [
    {
        "name": "profile",
        "description": "Shows information about a steam profile",
        "options": [
            {
                "type": 3,
                "name": "URL",
                "description": "Type in a URL of the profile (can be a steamID too!)",
                "default": false,
                "required": true
            }
        ]
    },
    {
        "name": "steamid",
        "options": [
            {
                "type": 3,
                "name": "url",
                "description": "Type in a URL of the profile",
                "default": false,
                "required": true
            }
        ],
        "description": "Gives the steamID of the profile"
    },
    {
        "name": "showcase",
        "description": "Generates a profile showcase (screenshot) of a profile",
        "options": [
            {
                "type": 3,
                "name": "URL",
                "description": "Type in a URL of the profile (can be a steamID too!)",
                "default": false,
                "required": true
            }
        ]
    }
];
async function main() {
    const args = process.argv.slice(2);
    var apiEndpoint;
    switch (args[0]) {
        case 'global':
            apiEndpoint = `https://discord.com/api/v8/applications/${client.user.id}/commands`;
            break;
        case 'guild':
            apiEndpoint = `https://discord.com/api/v8/applications/${client.user.id}/guilds/${args[1]}/commands`;
            break;
        default:
            console.log('Proper use case: \n firstrun.js guildid <id of your guild> \n or \n firstrun.js global');
            process.exit();
    }
    console.log(apiEndpoint);
    commands.forEach(command => {
        (async () => {
            const response = await fetch(apiEndpoint, {
                method: 'post',
                body: JSON.stringify(command),
                headers: {
                    'Authorization': 'Bot ' + config.token,
                    'Content-Type': 'application/json'
                }
            })
            const json = await response.json();
            console.log(json);
        })();
    });
    process.exit();
}


client.on('ready', () => {
    console.log('Mist - firstrun program');
    console.log(`Logged in as a bot: ${client.user.tag}`);
    client.user.setPresence({ activity: { type: `LISTENING`, name: `SETTING UP!` }, status: `dnd` }); //status
    main();
});
client.login(config.token);//logging in
