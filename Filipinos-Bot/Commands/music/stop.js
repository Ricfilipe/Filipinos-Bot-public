
const {EmbedBuilder, SlashCommandBuilder} = require("discord.js");
const {joinVoiceChannel} = require("@discordjs/voice");
const MusicMenu = require("../../Modules/musicMenu");

module.exports= {
    data:
        new SlashCommandBuilder()
            .setName('stop')
            .setDescription('Stops playing music and leaves channel')
    ,
    json: {
        "name": "stop",
        "description": "Stops playing music and leaves channel",
        "options":[],
        "default_permission": false
    },
    callback: async ({client, interaction, args, guild, member, user, player}) => {
        stop(
            {
                interaction: interaction,
                player: player
            })
    },
    buttons:
        {
            stop : stop,
            skip : skip
        }
}

async function stop({interaction, player}) {
    const queue = player.getQueue(interaction.guild.id)
    if (!queue) return {content:`There is nothing in the queue right now!`, ephemeral:true}
    queue.stop()
    const embed = new EmbedBuilder()
        .setAuthor({name:"Stoped music",iconURL:interaction.guild.iconURL()})
        .setColor("#2268f5")

    if(player.menu[interaction.guild.id])
    {
        player.menu[interaction.guild.id].cleanUp()
        delete player.menu[interaction.guild.id]
    }

    return {embeds:[embed]};
}

async function skip({interaction, player}) {
    const queue = player.getQueue(interaction.guild.id);
    if(queue.songs.length === 1)
    {
        await stop({interaction:interaction, player:player})
    }
    else
    {
        queue.skip()
        //await player.menu[interaction.guild.id].updateMenu()
    }

    return {content: "Skipped Music", ephemeral:true};
}