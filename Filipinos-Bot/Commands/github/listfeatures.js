const { Octokit } = require("@octokit/core");
const { EmbedBuilder } = require('discord.js');
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

        const { data } = await octokit.request("/repos/Ricfilipe/Filipinos-Bot-public/issues");
        const embed =  new EmbedBuilder();
        embed.setAuthor({name:"Filipinos-Bot",iconURL:guild.iconURL()})
            .setTitle("All Requested Features")

        let cnt = "";
        for(let i = 0;i<data.length;i++){
            embed.addFields({name: "• #"+data[i].number+" "+data[i].title, value: ""+data[i].body.split("\n")[0]|| "Requested through github"});
            cnt = cnt+ data[i].title+"\n"
        }


        return {embeds:[embed]};
    }
}

