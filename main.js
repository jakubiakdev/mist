const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json'); 

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
    client.api.interactions(interaction.id, interaction.token).callback.post({data: {
        type: 4,
        data: {
            "embeds": [
              {
                "description": "hi",
                "color": 8777630
              }
            ]
          }
      }})
})
/*
TODO:
 - There is no distinguishing between commands
 - there is actually 0 api implementation, it just sends out an embed
 - eval should probably be removed and moved to anoter file in repo so it would be used only for debugging
 - creating a slash command isn't implemented or even explained
*/ 





client.login(config.token);//logging in