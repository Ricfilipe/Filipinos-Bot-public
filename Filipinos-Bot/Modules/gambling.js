const TOKEN = process.env.TOKEN;
require('dotenv').config();

const {Client,GatewayIntentBits, Partials }= require('discord.js');
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });
const GambleDB = require('./Connections/GambleDB');

function distributePoints(v, k ,map){
    GambleDB.distributePoints(v);
}

module.exports = class PointDistributor {
    constructor(servers) {
        this.servers = servers

        async function points(servers){
            await GambleDB.gettable();


            function distrubute(item, index, arr)
            {
                const list = bot.guilds.cache.get(item);
                if(list) {
                    list.members.cache.forEach(distributePoints);
                }else{
                    bot.login(TOKEN);
                    bot.guilds.fetch(item);
                }
            }

            servers.forEach(distrubute)
        }
        points(this.servers);
        setInterval(points, 60000, this.servers);
    }

    addNewServer(server)
    {
        this.servers.push(server)
    }
}