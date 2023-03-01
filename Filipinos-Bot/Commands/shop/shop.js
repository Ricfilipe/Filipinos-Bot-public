
const { EmbedBuilder } = require('discord.js');
const GambleUser = require('../../Modules/Data/gambleUser');
const ShopEntity= require('../../Modules/Data/shopEntity');

const shopEntity = new ShopEntity();


module.exports= {
    json: {
        "name": "shop",
        "description": "Displays point shop",

    },
    callback: async ({client, interaction, args, guild, member, user}) => {
        let guser = new GambleUser(user.id);

        let embed = shopEntity.displayShop();
        embed.setAuthor({name:"Filipinos-Bot",iconURL: guild.iconURL()})
            .setFooter( {text:user.tag+" has " +guser.getPoints()+" points",iconURL:user.avatarURL()});

        return {embeds:[embed]};
    }
}