
const {EmbedBuilder, SlashCommandBuilder} = require("discord.js");
const {joinVoiceChannel} = require("@discordjs/voice");
const SearchResultType = require("distube");
const SearchResult = require("distube");



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
            const song = await player.search(interaction.options.getString("query"),
                {
                    limit: 1,
                    safeSearch: false
                });

            player.play(member.voice.channel, song , {
                member: member,
                textChannel: interaction.channel
            })

            const embed = new EmbedBuilder()
                .setAuthor({name:"Added music to queue",iconURL:guild.iconURL()})
                .setTitle(song[0].name)
                .setURL(song[0].url)
                .setThumbnail(song[0].thumbnail)
                .setFooter({text:"Requested by " + member.displayName, iconURL: user.avatarURL()})
                .setDescription("Duration: " + song[0].formattedDuration)

            return {embeds:[embed]};
        }

        return  {content:`You need to enter voice channel!`, ephemeral:true};
    }
}