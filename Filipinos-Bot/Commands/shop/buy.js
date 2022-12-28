
const { EmbedBuilder } = require('discord.js');
const GambleUser = require('../../Modules/Data/gambleUser');
const ShopEntity= require('../../Modules/Data/shopEntity');

const shopEntity = new ShopEntity();


module.exports= {
    json: generateJson(),
    callback: async ({client, interaction, args, guild, member, user}) => {
        const message = await shopEntity.buy(args.getString('buy'),args.getString('arguments'),client,user,guild,member,interaction);
        return message;

    }


}



function generateJson(){
    const items = shopEntity.getItems()
    const choices = []

   for(let item of items){
        choices.push({"name": item,
                      "value": item})
    }

    return {
            "name": "buy",
            "description": "Buy a item from the shop",
            "options":[   {
            "name": "item",
            "description": "this doesnt work is just a test",
            "type": 3,
            "choices": choices,
            "required": true,

            },
        {
            "name": "arguments",
            "description": "this doesnt work is just a test",
            "type": 3,
        },
        ]
    }
}