const { EmbedBuilder } = require('discord.js');
const GambleUser = require('../../Modules/Data/gambleUser');

module.exports= {
    json: {
        "name": "give",
        "description": "Shows your points",
        "options":[   {
            "name": "person",
            "description": "the person who you want to give points",
            "type": 6,
            "required": true,
        },
            {
                "name": "points",
                "description": "the amount of points you want to give",
                "type": 4,
                "required": true,
            }]
    },
    callback: async ({client, interaction, args, guild, member, user}) => {
        let guser = new GambleUser(user.id);
        if(guser.getPoints()<args.getInteger('points')){
                    return user.tag +" doesn't have enough points";
        }else {
            guser.removePoints(args.getInteger('points'));
            const taggedUser = args.getUser('person')
            let guser2 = new GambleUser(taggedUser.id);
            const embed = new EmbedBuilder()
                .setColor('#45b538')
                .setAuthor({name:taggedUser.tag, iconURL:taggedUser.avatarURL()})
                .setDescription(":gift: Has received " + args.getInteger('points') + " points from " + user.tag + " :gift:");
            guser2.addPoints(args.getInteger('points'));
           return {embeds:[embed]};
        }


    }
}