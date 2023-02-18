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
        "name": "add-template",
        "description": "Associates a tempalte ID with a name",
        "options":[            {
            "name": "name",
            "description": "Name that will be associated with that template",
            "type": 3,
            "required": true,
            },
            {
                "name": "template-id",
                "description": "Template ID in imgflip" +
                    "",
                "type": 3,
                "required": true,
            }]
    },
    callback: async ({client, interaction, args, guild, member, user}) => {
        let templateId = interaction.options.getString("template-id")
        let name = interaction.options.getString("name")
        const embed = new EmbedBuilder().setColor('#5bff51')
        let result = await MemeDB.newMemeTemplate(templateId, name, guild.id)


        if(result)
        {
            embed.setAuthor({name: "Associated template-id '" + templateId + "' with name '" + name + "'" , iconURL:guild.iconURL()})
        }
        else
        {
            embed.setAuthor({name: "Failed to associate template-id '" + templateId + "' with name '" + name + "'" , iconURL:guild.iconURL()})
        }

        return {embeds: [embed], ephemeral: true}
    }
    , permissions:["admin","bot-owner"]
}

