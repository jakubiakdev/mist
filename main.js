const Discord = require('discord.js');
const SteamAPI = require('steamapi');
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
                console.log(summary);
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: {
                            "embeds": [
                            {
                                title: summary.nickname, //get all the fun stuff from steamapi playersummary and sends it as an embed
                                thumbnail: { "url": summary.avatar.large },
                                fields: [
                                    {
                                      name: "SteamID: ",
                                      value: summary.steamID,
                                      inline: true
                                    }
                                  ]
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
                            title: `SteamID of ${interaction.data.options[0].value}`,
                            description: `${steamid}` //sends it as an embed
                        }
                        ]
                    }
                }});
        });
    }
    }
)






client.login(config.token);//logging in