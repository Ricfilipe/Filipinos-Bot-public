const { EmbedBuilder } = require('discord.js');
const MemeDB = require('../../Modules/Connections/MemeDB');
const Imgflip = require('imgflip')
require('dotenv').config();
const TOKEN_USER_IMGFLIP = process.env.TOKEN_USER_IMGFLIP;
const TOKEN_PASS_IMGFLIP = process.env.TOKEN_PASS_IMGFLIP;

const memeGenerator = new Imgflip.default({
    username: TOKEN_USER_IMGFLIP,
    password: TOKEN_PASS_IMGFLIP
})

module.exports= {
    json: {
        "name": "rem-template",
        "description": "Clears association of a tempalte ID with a name",
        "options":[            {
            "name": "name",
            "description": "Name that will be associated with that template",
            "type": 3,
            "required": true,
        }]
    },
    callback: async ({client, interaction, args, guild, member, user}) => {
        let name = interaction.options.getString("name")
        const embed = new EmbedBuilder().setColor('#5bff51')
        let result = await MemeDB.remMemeTemplate(name, guild.id)

        if(result)
        {
            embed.setAuthor({name: "Name '" + name + "' is no longer associated with a template ID" , iconURL:guild.iconURL()})
        }
        else
        {
            embed.setAuthor({name: "Operation failed, name '" + name + "' not found in database!" , iconURL:guild.iconURL()})
        }

        return {embeds: [embed], ephemeral: true}
    }
    , permissions:["admin","bot-owner"]
}