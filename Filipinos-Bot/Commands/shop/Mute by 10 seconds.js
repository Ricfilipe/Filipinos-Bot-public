

const ShopEntity= require('../../Modules/Data/shopEntity');

const shopEntity = new ShopEntity();


module.exports= {
    json: {
        "name": "Mute by 10 seconds",
        "type": "2",
        },
    callback: async ({client, interaction, args, guild, member, user}) => {
        const message = await shopEntity.buy("mute","<@!" + interaction.data.target_id + "> 10",client,user,guild,member,interaction);
        return message;

    }
}