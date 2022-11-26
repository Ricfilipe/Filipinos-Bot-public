const GambleDB = require('../../Modules/Connections/GambleDB');
const { MessageEmbed } = require('discord.js');
const GambleUser = require('../../Modules/Data/gambleUser');

module.exports= {
    json: {
        "name": "roulette",
        "description": "50% chance of doubling your points!",
        "options":[            {
            "name": "value",
            "description": "amount gambled",
            "type": 4,
            "required": true,
        }]
    },
    callback: async ({client, interaction, args, guild, member, user}) => {
        let guser = new GambleUser(user.id);
        let text_response = "";
        let embed_response;

        if (guser.getPoints() < args.value) {
            text_response = user.tag+ " doesn't have enough points";
        } else {
            const embed = new MessageEmbed().setAuthor({name:user.tag, iconURL:user.avatarURL()});
            if (roll()) {
                embed.setDescription("Just won " + args.getInteger("value")+ " points!!! <:notBad:593836050703450112>").setColor('#0fff00')
                guser.addPoints(args.getInteger("value"));
            } else {
                embed.setDescription("Just lost " + args.getInteger("value")+ " points... <:feels:593831249823531028>").setColor('#ff0000')
                guser.removePoints(args.getInteger("value"));
            }
            embed_response = embed;
        }
        if(text_response!=="") {
            return {content: text_response, ephemeral: true};
        }
        return {embeds: [embed_response]};
    }
}

function roll(){
    return  Math.random()>=0.5;
}