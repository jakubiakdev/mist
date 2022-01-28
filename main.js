const Discord = require('discord.js');
const SteamAPI = require('steamapi'); // api reference: https://github.com/xDimGG/node-steamapi#documentation and https://developer.valvesoftware.com/wiki/Steam_Web_API
const puppeteer = require('puppeteer');
require('dotenv').config();
const he = require('he');

const steam = new SteamAPI(process.env.STEAMAPI_TOKEN);
const client = new Discord.Client({intents: [Discord.Intents.FLAGS.GUILDS]});


client.on('ready', () => {
  console.log('Welcome to Mist');
  console.log(`Logged in as a bot: ${client.user.tag}`);
  console.log(`Current ID: ${client.user.id}`);
  console.log(`Bot invite (used for eval and checking nsfw): https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`);
  console.log(`Slashcommand invite (recommended): https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=applications.commands`);
  client.user.setPresence({activity: {type: `PLAYING`, name: `On steam`}, status: `online`}); // status
});

client.on('interactionCreate', async (interaction) => { // on slashcommand
  switch (interaction.commandName) {
    case 'profile': {
      steam.resolve(interaction.options.getString('url')).then((id) => {
        steam.getUserSummary(id).then((summary) => {
          steam.getUserLevel(id).then((level) => {
            interaction.reply({
              embeds: [
                {
                  color: process.env.COLOR,
                  author: {
                    'name': 'mist',
                    'url': process.env.WEBPAGE,
                  },
                  title: summary.nickname, // get all the fun stuff from steamapi playersummary and sends it as an embed
                  thumbnail: {'url': summary.avatar.large},
                  fields: [
                    {
                      name: 'Privacy option: ',
                      value: summary.visibilityState == 3 ? 'Public' : 'Private',
                      inline: false,
                    },
                    {
                      name: 'Current status: ',
                      value: ['Offline ⚫', 'Online 🟢', 'Busy 🔴', 'Away 🟡', 'Snooze 🔵', 'Looking to trade 📦', 'Looking to play 🎮', 'Unknown'][summary.personaState],
                      inline: true,
                    },
                    {
                      name: 'SteamID: ',
                      value: summary.steamID,
                      inline: true,
                    },
                    {
                      name: 'Level: ',
                      value: level.toString() || 'Unknown',
                      inline: true,
                    },
                    {
                      name: 'Real name: ',
                      value: summary.realName || 'Not provided',
                      inline: true,
                    },
                    {
                      name: 'Country: ',
                      value: summary.countryCode == undefined ? 'Unknown' : `:flag_${summary.countryCode.toLowerCase()}:`,
                      inline: true,
                    },
                    {
                      name: 'URL: ',
                      value: summary.url,
                      inline: false,
                    },
                    {
                      name: 'Last online: ',
                      value: summary.lastLogOff == undefined ? 'Unknown' : new Date(summary.lastLogOff * 1000).toString(),
                      inline: true,
                    },
                    {
                      name: 'Creation time: ',
                      value: summary.created == undefined ? 'Unknown' : new Date(summary.created * 1000).toString(),
                      inline: true,
                    },
                  ],
                  footer: {
                    text: 'Steam profile summary',
                  },
                },
              ],
            });
          });
        })
            .catch((error) => {
              interaction.reply({
                embeds: [
                  {
                    color: process.env.COLOR,
                    author: {
                      'name': 'mist',
                      'url': process.env.WEBPAGE,
                    },
                    title: `Something has gone wrong! ⚠️`,
                    description: `${error}`,
                  },
                ],
                ephemeral: true,
              });
            });
      })
          .catch((error) => {
            interaction.reply({
              embeds: [
                {
                  color: process.env.COLOR,
                  author: {
                    'name': 'mist',
                    'url': process.env.WEBPAGE,
                  },
                  title: `Something has gone wrong! ⚠️`,
                  description: `${error}`,
                },
              ],
              ephemeral: true,
            });
          });
      break;
    }
    case 'steamid': {
      const url = interaction.options.getString('url');
      steam.resolve(url).then((steamid) => { // gets steamid from steamapi lib
        interaction.reply({
          embeds: [
            {
              color: process.env.COLOR,
              author: {
                'name': 'mist',
                'url': process.env.WEBPAGE,
              },
              title: `SteamID of ${url}`,
              description: `${steamid}`,
            },
          ],
        });
      })
          .catch((error) => {
            interaction.reply({
              embeds: [
                {
                  color: process.env.COLOR,
                  author: {
                    'name': 'mist',
                    'url': process.env.WEBPAGE,
                  },
                  title: `Something has gone wrong! ⚠️`,
                  description: `${error}`,
                },
              ],
              ephemeral: true,
            });
          });
      break;
    }
    case 'showcase': {
      if (client.channels.cache.get(interaction.channelId) != undefined && client.channels.cache.get(interaction.channelId).nsfw == true) {
        steam.resolve(interaction.options.getString('url')).then((id) => {
          steam.getUserSummary(id).then((summary) => {
            interaction.deferReply();
            (async () => {
              const browser = await puppeteer.launch({defaultViewport: {width: 1920, height: 1080}, headless: true});
              const page = await browser.newPage();
              page.setJavaScriptEnabled(false);
              await page.goto(`https://steamcommunity.com/profiles/${summary.steamID}`); // go to profile page
              await page.evaluate(() => {
                const dom = document.querySelector('#global_header'); // remove top and bottom bars from steam page
                dom.parentNode.removeChild(dom);
              });
              await page.evaluate(() => {
                const dom = document.querySelector('#footer');
                dom.parentNode.removeChild(dom);
              });
              await page.evaluate(() => {
                const dom = document.querySelector('.profile_comment_area');
                dom.parentNode.removeChild(dom);
              });
              const screenshot = await page.screenshot({type: 'png', fullPage: true, encoding: 'buffer'});
              const attachment = new Discord.MessageAttachment(screenshot, 'screenshot.png'); // take a screenshot and make it a messageattachment
              await browser.close();
              const embed = new Discord.MessageEmbed().setColor('0x00B9F2').setImage('attachment://screenshot.png').setAuthor('mist', '', process.env.WEBPAGE).setTitle(`Steam profile showcase of ${summary.nickname}`).setFooter('Steam profile showcase');
              interaction.followUp({embeds: [embed], files: [attachment]}); // send a followup with the screenshot
            })();
          });
        })
            .catch((error) => {
              interaction.reply({
                embeds: [
                  {
                    color: process.env.COLOR,
                    author: {
                      'name': 'mist',
                      'url': process.env.WEBPAGE,
                    },
                    title: `Something has gone wrong! ⚠️`,
                    description: `${error}`,
                  },
                ],
                ephemeral: true,
              });
            });
      } else if (client.channels.cache.get(interaction.channelId) != undefined && client.channels.cache.get(interaction.channelId).nsfw == false) {
        interaction.reply({
          embeds: [
            {
              color: process.env.COLOR,
              author: {
                'name': 'mist',
                'url': process.env.WEBPAGE,
              },
              title: `Something went wrong! ⚠️`,
              description: `You cannot use this command on non-nsfw channels!`,
            },
          ],
          ephemeral: true,
        });
      } else {
        interaction.reply({
          embeds: [
            {
              color: process.env.COLOR,
              author: {
                'name': 'mist',
                'url': process.env.WEBPAGE,
              },
              title: `Something went wrong! ⚠️`,
              description: `For this command, bot needs to be [invited](https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=1024) (even with minimum permissions) to check if channel is nsfw`,
            },
          ],
        });
      }
      break;
    }
    case 'gamestats': { // this looks fucking terrible
      interaction.deferReply();
      steam.resolve(interaction.options.getString('url')).then((id) => {
        steam.getUserStats(id, interaction.options.getString('gameid')).then((playerstats) => {
          const attachment = new Discord.MessageAttachment(Buffer.from(JSON.stringify(playerstats.stats, null, '  '), 'utf8'), 'stats.json'); // while json might not be a proper filetype, it looks better on discord
          const embed = new Discord.MessageEmbed().setColor('0x00B9F2').setAuthor('mist', '', process.env.WEBPAGE).setTitle(`Game stats of user ${id} for game ${gameid.value}`);
          interaction.followUp({embeds: [embed], files: [attachment]});
        });
      })
          .catch((error) => {
            interaction.followUp({
              embeds: [
                {
                  color: process.env.COLOR,
                  author: {
                    'name': 'mist',
                    'url': process.env.WEBPAGE,
                  },
                  title: `Something has gone wrong! ⚠️`,
                  description: `${error}`,
                },
              ],
              ephemeral: true,
            });
          });
      break;
    }
    case 'playercount': {
      steam.getGameDetails(interaction.options.getInteger('gameid')).then((gameDetails) => {
        steam.getGamePlayers(interaction.options.getInteger('gameid')).then((playercount) => {
          interaction.reply({
            embeds: [
              {
                color: process.env.COLOR,
                author: {
                  'name': 'mist',
                  'url': process.env.WEBPAGE,
                },
                title: `Number of people playing ${gameDetails.name}`,
                description: `${playercount}`,
              },
            ],
          });
        })
            .catch((error) => {
              interaction.reply({
                embeds: [
                  {
                    color: process.env.COLOR,
                    author: {
                      'name': 'mist',
                      'url': process.env.WEBPAGE,
                    },
                    title: `Something has gone wrong! ⚠️`,
                    description: `${error}`,
                  },
                ],
                ephemeral: true,
              });
            });
      }).catch((error) => {
        interaction.reply({
          embeds: [
            {
              color: process.env.COLOR,
              author: {
                'name': 'mist',
                'url': process.env.WEBPAGE,
              },
              title: `Something has gone wrong! ⚠️`,
              description: `${error}`,
            },
          ],
          ephemeral: true,
        });
      });
      break;
    }
    case 'game': {
      steam.getGameDetails(interaction.options.getInteger('gameid')).then((gameDetails) => {
        interaction.reply({
          embeds: [
            {
              color: process.env.COLOR,
              author: {
                'name': 'mist',
                'url': process.env.WEBPAGE,
              },
              title: `${gameDetails.name}`,
              description: he.decode(gameDetails.short_description),
              image: {url: gameDetails.header_image},
              fields: [
                {
                  name: 'Price',
                  value: gameDetails.is_free ? 'Free' : gameDetails.price_overview.final_formatted,
                  inline: false,
                },
                {
                  name: 'Metacritic',
                  value: gameDetails.metacritic?.score.toString() || 'Not Listed', // js is weird
                  inline: true,
                },
                {
                  name: 'Release date',
                  value: gameDetails.release_date.date,
                  inline: true,
                },
                {
                  name: 'Controller support',
                  value: gameDetails.controller_support || 'Unknown',
                  inline: true,
                },
                {
                  name: 'Categories:',
                  value: gameDetails.categories.map((category) => category.description).join(', '),
                  inline: false,
                },
                {
                  name: 'Developers',
                  value: gameDetails.developers.join(', '),
                  inline: false,
                },
                {
                  name: 'Publishers',
                  value: gameDetails.publishers.join(', '),
                  inline: false,
                },
              ]}]});
      })
          .catch((error) => {
            interaction.reply({
              embeds: [
                {
                  color: process.env.COLOR,
                  author: {
                    'name': 'mist',
                    'url': process.env.WEBPAGE,
                  },
                  title: `Something has gone wrong! ⚠️`,
                  description: `${error}`,
                },
              ],
              ephemeral: true,
            });
          });
      break;
    }
    case 'bans': {
      steam.resolve(interaction.options.getString('url')).then((id) => { // gets steamid from steamapi lib
        steam.getUserSummary(id).then((summary) => {
          steam.getUserBans(id).then((userbans) => {
            interaction.reply({
              embeds: [
                {
                  color: process.env.COLOR,
                  author: {
                    'name': 'mist',
                    'url': process.env.WEBPAGE,
                  },
                  title: `Game bans of ${summary.nickname}`,
                  fields: [
                    {
                      name: 'Vac Banned?',
                      value: userbans.vacBanned == undefined ? 'Not Banned' : 'Banned',
                      inline: true,
                    },
                    {
                      name: 'Game banned?',
                      value: userbans.gameBanned == undefined ? 'Not Banned' : 'Banned',
                      inline: true,
                    },
                    {
                      name: 'Community Banned?',
                      value: userbans.communityBanned == undefined ? 'Not Banned' : 'Banned',
                      inline: true,
                    },
                    {
                      name: 'Vac bans: ',
                      value: userbans.vacBans.toString(),
                      inline: false,
                    },
                    {
                      name: 'Game bans: ',
                      value: userbans.gameBans.toString(),
                      inline: false,
                    },
                    {
                      name: 'Days since last ban:',
                      value: userbans.daysSinceLastBan == undefined ? 'Not Banned' : userbans.daysSinceLastBan.toString(),
                      inline: false,
                    },
                  ],
                },
              ],
            });
          });
        });
      })
          .catch((error) => {
            interaction.reply({
              embeds: [
                {
                  color: process.env.COLOR,
                  author: {
                    'name': 'mist',
                    'url': process.env.WEBPAGE,
                  },
                  title: `Something has gone wrong! ⚠️`,
                  description: `${error}`,
                },
              ],
              ephemeral: true,
            });
          });
      break;
    }
    default: {
      interaction.reply({
        embeds: [
          {
            color: process.env.COLOR,
            author: {
              'name': 'mist',
              'url': process.env.WEBPAGE,
            },
            title: `Something went wrong! ⚠️`,
            description: `${interaction.commandName} is not expected`,
          },
        ],
        ephemeral: true,
      });
    }
      console.error(`Slashcommand "${interaction.commandName}" was not expected!`);
      break;
  }
},
);

process.on('uncaughtException', (uncaughtException) => { // do not let the process crash, instead let's just log it
  console.error('Something has gone wrong! ' + uncaughtException);
});


client.login();// logging in
