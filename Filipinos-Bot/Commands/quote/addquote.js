const QuoteDB = require('../../Modules/Connections/QuoteDB');
const { EmbedBuilder } = require('discord.js');
const Discord = require('discord.js');

module.exports= {
    json: {
        "name": "addquote",
        "description": "Tells a random quote from a person",
        "options":[            {
            "name": "person",
            "description": "Person",
            "type": 6,
            "required": true,
        },{
            "name": "content",
            "description": "Person's quote",
            "type": 3,
            "required": true,
        }]
    },
    callback: async ({client, interaction, args, guild, member, user}) => {

        quote_str = args.getString('content').trimStart();
        const taggedUser = args.getUser('person');
        QuoteDB.newQuote(taggedUser.id,taggedUser.tag,quote_str,guild.id)
        response="Added quote";

        return {content:response};
}, permissions:["admin","bot-owner"]
}