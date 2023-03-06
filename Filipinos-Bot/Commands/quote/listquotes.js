const QuoteDB = require('../../Modules/Connections/QuoteDB');
const { EmbedBuilder } = require('discord.js');
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
        const taggedUserId = args.getUser("person").id;
        await interaction.deferReply();
        const taggedUser = await client.users.fetch(taggedUserId)
        const embed = new EmbedBuilder().setAuthor({name: taggedUser.tag,iconURL: taggedUser.avatarURL()});
        const list = await QuoteDB.listQuote(taggedUserId,guild.id);
        for (let [key, val] of list) {
                embed.addFields({name: val, value: key.toString()});
        }
        await interaction.editReply({embeds:[embed]});
        return null;
    },
}








