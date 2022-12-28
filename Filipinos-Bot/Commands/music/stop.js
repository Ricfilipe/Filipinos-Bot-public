
const {EmbedBuilder, SlashCommandBuilder} = require("discord.js");
const {joinVoiceChannel} = require("@discordjs/voice");



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

        const queue = player.getQueue(message)
        if (!queue) return {content:`There is nothing in the queue right now!`, ephemeral:true}
        queue.stop()
        return  {content:`Stopped playing music!`, ephemeral:true};
    }
}