const { Octokit } = require("@octokit/core");
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();
const TOKEN_GITHUB = process.env.TOKEN_GITHUB;

module.exports= {
    json: {
        "name": "addfeature",
        "description": "Adds a new feature request",
        "options":[            {
            "name": "feature",
            "description": "Type the new feature you want to add!",
            "type": 3,
            "required": true,
        }]
    },
    callback: async ({client, interaction, args, guild, member, user}) => {
        let param = args.getString('feature');

        const octokit = new Octokit({
            auth: TOKEN_GITHUB,
        });

        const { data } = await octokit.request("POST /repos/Ricfilipe/Filipinos-Bot-public/issues",{
            owner: 'Ricfilipe',
            repo: 'Filipinos-Bot-public',
            title: param,
            body: "Requested by "+ user.tag +"\n"
        });
        const embed = new EmbedBuilder();
        embed.setAuthor({name:"Filipinos-Bot",iconURL: guild.iconURL()})
            .setTitle("Added new Request")
            .setDescription(param)
            .setFooter({text:"Requested by "+user.tag,iconURL: user.avatarURL()})

        return {embeds:[embed]}
    }
}

