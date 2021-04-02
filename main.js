const Discord = require('discord.js');
const SteamAPI = require('steamapi'); // api reference: https://github.com/xDimGG/node-steamapi#documentation and https://developer.valvesoftware.com/wiki/Steam_Web_API
const client = new Discord.Client();
const config = require('./config.json'); 

const steam = new SteamAPI(config.apikeys.steam);


client.on('ready', () => { 
	console.log('Welcome to Mist'); 
	console.log(`Logged in as a bot: ${client.user.tag}`);
	console.log(`Current ID: ${client.user.id}`);
    console.log(`Bot invite (generated from id, should be used only for eval): https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`);
    console.log(`Slashcommand invite (recommended): https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=applications.commands&permissions=8`)
	client.user.setPresence({ activity: { type: `COMPETING`, name: `hewwo`}, status: `online`}); //status
});

client.on('message', message => {   //eval handling
    const args = message.content.split(" ").slice(1);

    if (message.mentions.has(client.user)) {
        if(message.author.id !== config.ownerid) return;
        try {
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string"){
                evaled = require("util").inspect(evaled);
            }
            message.channel.send(evaled, {code:"xl"});
        } catch (err) {
            message.channel.send(`error: ${err} `)
        }
    }
});

client.ws.on('INTERACTION_CREATE', async interaction => { //on slashcommand
    if(interaction.data.name == 'profile') { 
        steam.resolve(interaction.data.options[0].value).then(id => {
            steam.getUserSummary(id).then(summary => {
                console.debug(summary);
                var correctRealName = summary.realName || "Not provided";
                if (summary.created == undefined) {
                    var correctCreationTime = "Unknown";
                }else{
                    var correctCreationTime = new Date(summary.created * 1000);
                };
                switch(summary.personaState) {
                    case 0:
                        var correctPersonaState = "Offline ⚫"
                        break;
                    case 1:
                        var correctPersonaState = "Online 🟢"
                        break;
                    case 2:
                        var correctPersonaState = "Busy 🔴"
                        break;
                    case 3:
                        var correctPersonaState = "Away 🟡"
                        break;
                    case 4:
                        var correctPersonaState = "Snooze 🔵"
                        break;
                    case 5:
                        var correctPersonaState = "Looking to trade 📦"
                        break;
                    case 5:
                        var correctPersonaState = "Looking to play 🎮"
                        break;
                    default:
                        var correctPersonaState = "Unknown"
                        break;
                };
                if (summary.visibilityState == 3) { var correctPrivacyOption = "Public"} else { var correctPrivacyOption = "Private"};
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: {
                            "embeds": [
                            {
                                color: "47602",
                                author: { 
                                    "name": "mist",
                                    "url": config.webpage
                                },
                                title: summary.nickname, //get all the fun stuff from steamapi playersummary and sends it as an embed
                                thumbnail: { "url": summary.avatar.large },
                                fields: [
                                    {
                                        name: "Privacy option: ",
                                        value: correctPrivacyOption,
                                        inline: false
                                    },
                                    {
                                        name: "Current status: ",
                                        value: correctPersonaState,
                                        inline: true
                                    },
                                    {
                                        name: "SteamID: ",
                                        value: summary.steamID,
                                        inline: true
                                    },
                                    {
                                        name: "URL: ",
                                        value: summary.url,
                                        inline: false
                                    },
                                    {
                                        name: "Creation time: ",
                                        value: correctCreationTime,
                                        inline: true
                                    },
                                    {
                                        name: "Real name: ",
                                        value: correctRealName,
                                        inline: true
                                    }
                                ],
                                footer: {
                                    text: "Steam profile summary"
                                }
                            }
                            ]
                        }
                    }}); 
            })
        });
    } else if (interaction.data.name == 'steamid') {
        steam.resolve(interaction.data.options[0].value).then(steamid => { //gets steamid from steamapi lib
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        "embeds": [
                        {
                            color: "47602",
                            author: { 
                                "name": "mist",
                                "url": config.webpage
                            },
                            title: `SteamID of ${interaction.data.options[0].value}`,
                            description: `${steamid}` //sends it as an embed
                        }
                        ]
                    }
                }});
        });
    }
    process.on('uncaughtException', uncaughtException => { //on the error, lets send an embed with the error message from the lib
        console.error("Something has gone wrong! " + uncaughtException);
        client.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 4,
                data: {
                    "embeds": [
                    {
                        color: "47602",
                        author: { 
                            "name": "mist",
                            "url": config.webpage
                        },
                        title: `Something has gone wrong! ⚠️`,
                        description: `${uncaughtException}` //gets the error and sends it
                    }
                    ]
                }
            }});
    });
    }
);




client.login(config.token);//logging in