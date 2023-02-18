const { EmbedBuilder } = require('discord.js');
const MemeDB = require('../../Modules/Connections/MemeDB');
const Discord = require('discord.js');

module.exports= {
    json: {
        "name": "list-memes",
        "description": "Lists all memes association within a server",
    },
    callback: async ({client, interaction, args, guild, member, user}) => {
        const embed = new EmbedBuilder().setAuthor({name: "List of memes in " + guild.name,iconURL: guild.iconURL()});
        const list = await MemeDB.listMemeTemplates(guild.id);
        let listIds = [], listNames = []
        for (let [name, id] of list) {
            listIds.push(id)
            listNames.push(name)
        }
        embed.addFields({name: "Name", value: listNames.join("\n"), inline:true}, {name: "Template ID", value: listIds.join("\n"), inline:true})
             .setColor('#5bff51')
        return {embeds:[embed]};
    },
}








