const QuoteDB = require('../../Modules/Connections/QuoteDB');
const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js');

module.exports= {
    json: {
        "name": "listquotes",
        "description": "Lists all quotes from someone",
        "options":[            {
            "name": "person",
            "description": "Person",
            "type": 6,
            "required": true,
        }]
    },
    callback: async ({client, interaction, args, guild, member, user}) => {
        const taggedUserId = args.person;
        const taggedUser = await client.users.fetch(taggedUserId)
        const embed = new MessageEmbed().setAuthor(taggedUser.tag,taggedUser.avatarURL());
        const list = await QuoteDB.listQuote(taggedUserId,guild.id);
        for (let [key, value] of list) {
                embed.addField(value,key);
        }
        return {embeds:[embed]};
    },
}








