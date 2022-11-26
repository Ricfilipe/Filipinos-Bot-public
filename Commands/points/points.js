const GambleDB = require('../../Modules/Connections/GambleDB');
const { MessageEmbed } = require('discord.js');
const GambleUser = require('../../Modules/Data/gambleUser');

module.exports= {
    json: {
        "name": "points",
        "description": "Shows your points",

    },
    callback: async ({client, interaction, args, guild, member, user}) => {
        const guser= new GambleUser(user.id);

        const embed = new MessageEmbed()
            .setColor('#d2c153')
            .setAuthor({name:user.tag +' has:', iconURL:user.avatarURL()})
            .setDescription( guser.getPoints()+' points')


        return {embeds:[embed]};
    }
}