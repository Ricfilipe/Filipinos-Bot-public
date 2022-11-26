const { Octokit } = require("@octokit/core");
const { MessageEmbed } = require('discord.js');
require('dotenv').config();
const TOKEN_GITHUB = process.env.TOKEN_GITHUB;

module.exports= {
    json: {
        "name": "listfeatures",
        "description": "Lists all planed features",

    },
    callback: async ({client, interaction, args, guild, member, user}) => {
        const octokit = new Octokit({
            auth: TOKEN_GITHUB,
        });

        const { data } = await octokit.request("/repos/Ricfilipe/Filipinos-Bot/issues");
        const embed =  new MessageEmbed();
        embed.setAuthor({name:"Filipinos-Bot",iconURL:guild.iconURL()})
            .setTitle("All Requested Features")

        let cnt = "";
        for(let i = 0;i<data.length;i++){
            embed.addField("• #"+data[i].number+" "+data[i].title,""+data[i].body.split("\n")[0]|| "Requested through github");
            cnt = cnt+ data[i].title+"\n"
        }


        return {embeds:[embed]};
    }
}

