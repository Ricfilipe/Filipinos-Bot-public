const TOKEN = process.env.TOKEN;
require('dotenv').config();


const Discord = require('discord.js');
const bot = new Discord.Client({intents:[Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILDS]});
const GambleDB = require('./Connections/GambleDB');







function distributePoints(v, k ,map){

    GambleDB.distributePoints(v);

}

async function points(){
    await GambleDB.gettable();


    const list = bot.guilds.cache.get('252110350047117313');
    if(list) {
        list.members.cache.forEach(distributePoints);
    }else{
        bot.login(TOKEN);
        bot.guilds.fetch('252110350047117313');
    }



}
points();
setInterval(points, 60000);



module.exports ={}


