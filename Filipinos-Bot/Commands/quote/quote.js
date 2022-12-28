const QuoteDB = require('../../Modules/Connections/QuoteDB');
const { EmbedBuilder } = require('discord.js');

module.exports= {
    json: {
        "name": "quote",
        "description": "Tells a random quote from a person",
        "options":[            {
            "name": "person",
            "description": "Person",
            "type": 6,
            "required": true,
        }]
    },
    callback: async ({client, interaction, args, guild, member, user}) => {
        const taggedUser = args.getUser('person');

        const quote = await QuoteDB.getQuote(taggedUser.id,guild.id);
        const embed = new EmbedBuilder().setAuthor({name:taggedUser.tag,iconURL:taggedUser.avatarURL()})
            .setDescription(quote[0])
            .setColor('#883434').setFooter({text:""+quote[1]});
       return {embeds:[embed]};
    },

}








