
const {EmbedBuilder, SlashCommandBuilder} = require("discord.js");
const {joinVoiceChannel} = require("@discordjs/voice");



module.exports= {
    data:
        new SlashCommandBuilder()
            .setName('play')
            .setDescription('Adds a music to the queue to play')
            .addStringOption(option =>
                option.setName('query')
                    .setDescription('Can be URL or name of the music')
                    .setRequired(true))
    ,
    json: {
        "name": "play",
        "description": "Adds a music to the queue to play",
        "options":[   {
            "name": "query",
            "description": "Can be URL or name of the music",
            "type": 3,
            "required": true,
        }],
        "default_permission": false
    },
    callback: async ({client, interaction, args, guild, member, user, player}) => {

        if(member.voice.channel)
        {
            player.play(member.voice.channel, interaction.options.getString("query") , {
                member: member,
                textChannel: interaction.channel
            })

            return {content:`playing`, ephemeral:true};
        }

        return  {content:`You need to enter voice channel!`, ephemeral:true};
    }
}