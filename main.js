const Discord = require('discord.js');
const SteamAPI = require('steamapi'); // api reference: https://github.com/xDimGG/node-steamapi#documentation and https://developer.valvesoftware.com/wiki/Steam_Web_API
const client = new Discord.Client();
const config = require('./config.json');
const puppeteer = require('puppeteer');
const { setMaxListeners } = require('process');

const steam = new SteamAPI(config.apikeys.steam);


client.on('ready', () => {
    console.log('Welcome to Mist');
    console.log(`Logged in as a bot: ${client.user.tag}`);
    console.log(`Current ID: ${client.user.id}`);
    console.log(`Bot invite (generated from id, should be used only for eval): https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`);
    console.log(`Slashcommand invite (recommended): https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=applications.commands&permissions=8`)
    client.user.setPresence({ activity: { type: `COMPETING`, name: `hewwo` }, status: `online` }); //status
});

client.on('message', message => {   //eval handling
    const args = message.content.split(" ").slice(1);

    if (message.mentions.has(client.user)) {
        if (message.author.id !== config.ownerid) return;
        try {
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string") {
                evaled = require("util").inspect(evaled);
            }
            message.channel.send(evaled, { code: "xl" });
        } catch (err) {
            message.channel.send(`error: ${err} `)
        }
    }
});

client.ws.on('INTERACTION_CREATE', async interaction => { //on slashcommand
    switch (interaction.data.name) {
        case 'profile': {
            steam.resolve(interaction.data.options[0].value).then(id => {
                steam.getUserSummary(id).then(summary => {
                    let correctRealName, correctCreationTime, correctPersonaState, correctPrivacyOption, correctLastLogOff, correctCountry;
                    //console.debug(summary);
                    correctRealName = summary.realName || "Not provided";
                    if (summary.created == undefined) {
                        correctCreationTime = "Unknown";
                    } else {
                        correctCreationTime = new Date(summary.created * 1000);
                    };
                    correctPersonaState = ["Offline ⚫", "Online 🟢", "Busy 🔴", "Away 🟡", "Snooze 🔵", "Looking to trade 📦", "Looking to play 🎮", "Unknown"][summary.personaState]
                    if (summary.lastLogOff == undefined) {
                        correctLastLogOff = "Unknown";
                    } else {
                        correctLastLogOff = new Date(summary.lastLogOff * 1000);
                    };
                    if (summary.countryCode == undefined) {
                        correctCountry = "Unknown";
                    } else {
                        correctCountry = `:flag_${summary.countryCode.toLowerCase()}:`;
                    }
                    if (summary.visibilityState == 3) { correctPrivacyOption = "Public" } else { correctPrivacyOption = "Private" };
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
                                                name: "Real name: ",
                                                value: correctRealName,
                                                inline: true
                                            },
                                            {
                                                name: "Country: ",
                                                value: correctCountry,
                                                inline: true
                                            },
                                            {
                                                name: "URL: ",
                                                value: summary.url,
                                                inline: false
                                            },
                                            {
                                                name: "Last online: ",
                                                value: correctLastLogOff,
                                                inline: true
                                            },
                                            {
                                                name: "Creation time: ",
                                                value: correctCreationTime,
                                                inline: true
                                            }
                                        ],
                                        footer: {
                                            text: "Steam profile summary"
                                        }
                                    }
                                ]
                            }
                        }
                    });
                })
                    .catch(error => {
                        console.error(error);
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
                                            description: `${error}` //gets the error and sends it
                                        }
                                    ]
                                }
                            }
                        });
                    });
            })
                .catch(error => {
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
                                        description: `${error}` //gets the error and sends it
                                    }
                                ]
                            }
                        }
                    });
                });
            break;
        }
        case 'steamid': {
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
                    }
                })
            })
                .catch(error => {
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
                                        description: `${error}` //gets the error and sends it
                                    }
                                ]
                            }
                        }
                    });
                });
            break;
        }
        case 'showcase': {
            if (client.channels.cache.get(interaction.channel_id).nsfw == true) {
                steam.resolve(interaction.data.options[0].value).then(id => {
                    steam.getUserSummary(id).then(summary => {
                        client.api.interactions(interaction.id, interaction.token).callback.post({
                            data: {
                                type: 5,
                            }
                        });
                        (async () => {
                            const browser = await puppeteer.launch({ defaultViewport: { width: 1920, height: 1080 }, headless: true });
                            const page = await browser.newPage();
                            page.setJavaScriptEnabled(false);
                            await page.goto(`https://steamcommunity.com/profiles/${summary.steamID}`); //go to profile page
                            await page.evaluate(() => {
                                let dom = document.querySelector('#global_header'); //remove top and bottom bars from steam page
                                dom.parentNode.removeChild(dom);
                            });
                            await page.evaluate(() => {
                                let dom = document.querySelector('#footer');
                                dom.parentNode.removeChild(dom);
                            })
                            let screenshot = await page.screenshot({ type: 'png', fullPage: true, encoding: 'buffer' });
                            const attachment = new Discord.MessageAttachment(screenshot, 'screenshot.png'); //take a screenshot and make it a messageattachment
                            await browser.close();
                            let embed = new Discord.MessageEmbed().setColor('0x00B9F2').setImage('attachment://screenshot.png').setAuthor('mist', '', config.webpage).setTitle(`Steam profile showcase of ${summary.nickname}`).setFooter('Steam profile showcase');
                            new Discord.WebhookClient(client.user.id, interaction.token).send({ embeds: [embed], files: [attachment] }); //send a followup with the screenshot
                        })();
                    });
                })
                    .catch(error => {
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
                                            description: `${error}` //gets the error and sends it
                                        }
                                    ]
                                }
                            }
                        });
                    });
            } else if (client.channels.cache.get(interaction.channel_id).nsfw == false) {
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
                                    title: `Something went wrong! ⚠️`,
                                    description: `You cannot use this command on non-nsfw channels!` //gets the error and sends it
                                }
                            ]
                        }
                    }
                });
            } else {
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
                                    title: `Something went wrong! ⚠️`,
                                    description: `For this command, bot needs to be [invited](https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=1024) (even with minimum permissions) to check if channel is nsfw` //gets the error and sends it
                                }
                            ]
                        }
                    }
                });
            }
            break;
        }
        case 'gamestats': { //this looks fucking terrible
            let URL, gameid, buf;
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 5,
                }
            });
            URL = interaction.data.options.find(arg => arg.name === 'url');
            gameid = interaction.data.options.find(arg => arg.name === 'gameid');
            console.log(URL);
            console.log(gameid);
            steam.resolve(URL.value).then(id => {
                steam.getUserStats(id, gameid.value).then(playerstats => {
                    bufStr = JSON.stringify(playerstats.stats, null, '  ');
                    buf = Buffer.from(bufStr, 'utf8');
                    const attachment = new Discord.MessageAttachment(buf, 'stats.txt');
                    let embed = new Discord.MessageEmbed().setColor('0x00B9F2').setAuthor('mist', '', config.webpage).setTitle(`Game stats of user ${id} for game ${gameid.value}`);
                    new Discord.WebhookClient(client.user.id, interaction.token).send({ embeds: [embed], files: [attachment] }); 
                });
            })
                .catch(error => {
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
                                        description: `${error}` //gets the error and sends it
                                    }
                                ]
                            }
                        }
                    });
                });
            break;
        }
        default: {
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
                                title: `Something went wrong! ⚠️`,
                                description: `${interaction.data.name} is not expected` //gets the error and sends it
                            }
                        ]
                    }
                }
            });
            break;
        }
    }
}
);

process.on('uncaughtException', uncaughtException => { //on the error, lets send an embed with the error message from the lib
    console.error("Something has gone wrong! " + uncaughtException);
});


client.login(config.token);//logging in