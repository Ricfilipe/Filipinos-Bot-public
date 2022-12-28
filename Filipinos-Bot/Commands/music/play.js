
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
            const query = interaction.options.getString("query");
            const queue = player.createQueue(interaction.guild, {
                metadata: {
                    channel: interaction.channel
                }
            });

            try {
                if (!queue.connection) await queue.connect(interaction.member.voice.channel);
            } catch {
                queue.destroy();
                return { content: "Could not join your voice channel!", ephemeral: true };
            }

            const track = await player.search(query, {
                requestedBy: interaction.user
            }).then(x => x.tracks[0]);
            if (!track) return { content: `❌ | Track **${query}** not found!`};

            queue.play(track);

            const embed =  new EmbedBuilder();
            embed.setAuthor({name:"Filipinos-Bot",iconURL:guild.iconURL()})
                .setTitle("All Requested Features")


            return {content:`Playing!`, ephemeral:true};
        }

        return  {content:`You need to enter voice channel!`, ephemeral:true};
    }
}