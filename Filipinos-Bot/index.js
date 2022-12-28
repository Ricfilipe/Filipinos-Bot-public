require('dotenv').config();
const {Client,GatewayIntentBits, Partials }= require('discord.js');
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });
const TOKEN = process.env.TOKEN;

const AdministrationDB = require('./Modules/Connections/AdministrationDB');
const CommandLoader = require('./CommandLoader');
const gambling = require('./Modules/gambling');

const admin = require('./Modules/administration');

const shop = require('./Modules/shop');

const currentGamba = [];




const suffix = new Map();


let commandLoader;


bot.login(TOKEN);

bot.on('ready',  async () => {

  commandLoader = new   CommandLoader (bot,"Commands",bot.guilds.cache.map(guild => guild.id))

  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on("guildCreate", (guild) => {
  commandLoader.addNewGuild(guild.id);
});



function commands(msg,suf){

  if (msg.content === 'ping') {
    msg.reply('pong');
    msg.channel.send('pong');


  } else if (msg.content.startsWith(suf+'suffix')) {
    const param = msg.content.split(" ");
    if(param.length>=2){
      if(msg.member.hasPermission("ADMINISTRATOR")) {
        suffix[msg.guild.id] = param[1];
        AdministrationDB.createUpdate(msg.guild.id, param[1]);
        msg.channel.send('Suffix has been changed to ' + param[1]);
      }else{

        msg.channel.send("You don't have permissions :)");
      }
    }

  }



  admin.commands(msg,suf);

  shop(msg,suf);
}


bot.on('message', msg => {

  if(!suffix[msg.guild.id]){
    console.log("Retrieving suffix from server "+ msg.guild.name)
    let suf =AdministrationDB.getSuffix(msg.guild.id);
    suf.then(value => {
      if(value){
        suffix[msg.guild.id] = value;
        commands(msg,value);
        console.log("found suffix "+ suffix[msg.guild.id]);
      }else{
        suffix[msg.guild.id] = '!';
        commands(msg,'!');
        console.log("no suffix found, using default");
      }

      });
  }else{
    commands(msg, suffix[msg.guild.id])
  }
});
