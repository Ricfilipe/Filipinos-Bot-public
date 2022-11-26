const Discord = require('discord.js');
const QuoteDB = require('../../Modules/Connections/QuoteDB');

module.exports= {
    json: {
        "name": "remquote",
        "description": "Lists all quotes from someone",
        "options":[            {
            "name": "quote",
            "description": "Quote ID",
            "type": 3,
            "required": true,
        }]
    },
    callback: async ({client, interaction, args, guild, member, user}) => {
            quoteId = args.getString('quote').trimStart();
            if(QuoteDB.remQuote(quoteId,guild.id)) {
                return {content:'Removed quote with id ' + args.quote};
            }else{
                return {content:'Quote not found...'}
            }
    },
}