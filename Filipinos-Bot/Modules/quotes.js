const { EmbedBuilder } = require('discord.js');
const Discord = require('discord.js');
const bot = new Discord.Client();

const QuoteDB = require('./Connections/QuoteDB');

module.exports = async function quotes(msg,suf){
    if (msg.content.startsWith(suf+'quote')){
        if (msg.mentions.users.size) {
            const taggedUser = msg.mentions.users.first();
            const quote = await QuoteDB.getQuote(taggedUser.id);
            const embed = new EmbedBuilder().setAuthor(taggedUser.tag,taggedUser.avatarURL())
                .setDescription(quote[0])
                .setColor('#883434').setFooter(""+quote[1]);
            await msg.channel.send(embed);
        }else{
            msg.reply('Please tag a valid user!');
        }


    } else if (msg.content.startsWith(suf+'addquote')){
        if(msg.member.hasPermission("ADMINISTRATOR")) {
            if (!msg.mentions.users.size){
                msg.reply('Please tag a valid user!');
            }else {
                const str = msg.content.split('>');
                if(str.length>=2){
                    const taggedUser = msg.mentions.users.first();
                    str[1] = str[1].trimStart();
                    QuoteDB.newQuote(taggedUser.id,taggedUser.tag,str[1])
                    msg.channel.send("Added quote");
                }else{
                    msg.reply('Not enough parameters, try again...');
                }
            }
        }else{
            msg.channel.send("You don't have permissions :)");
        }
    }
    else if (msg.content.startsWith(suf+'remquote')){
        if(msg.member.hasPermission("ADMINISTRATOR")) {
            const str = msg.content.split(' ');
            if(str.length>=2){
                str[1] = str[1].trimStart();
                QuoteDB.remQuote(str[1]);
                msg.channel.send('Removed quote with id '+ str[1]);
            }else{
                msg.channel.send('Not enough parameters, try again...');
            }
        }else{
            msg.channel.send("You don't have permissions :)");
        }

    }
    else if (msg.content.startsWith(suf+'listquote')){
        if(msg.member.hasPermission("ADMINISTRATOR")) {
            if (!msg.mentions.users.size) {
                msg.channel.send('Please tag a valid user!');
            } else {
                const taggedUser = msg.mentions.users.first();
                const embed = new EmbedBuilder().setAuthor(taggedUser.tag,taggedUser.avatarURL());
                const list = await QuoteDB.listQuote(taggedUser.id);
                for (let [key, value] of list) {
                    embed.addField(value,key);
                }
                await msg.channel.send(embed);
            }
        }else{
            msg.channel.send("You don't have permissions :)");
        }
    }

}