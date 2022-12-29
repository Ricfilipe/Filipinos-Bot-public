
const {EmbedBuilder, SlashCommandBuilder} = require("discord.js");
const MusicMenu = require("../../Modules/musicMenu");

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
            let song = ""

            if(interaction.options.getString("query").startsWith("https://www.youtube.com/watch?v="))
            {
                song = interaction.options.getString("query")
            }
            else
            {
                song = await player.search(interaction.options.getString("query"),
                    {
                        limit: 1,
                        safeSearch: false
                    });
                song = song[0]
            }

            if(!player.menu[guild.id])
            {
                player.menu[guild.id] = new MusicMenu(guild, interaction.channel, player);
            }

            await interaction.deferReply();

            await player.play(member.voice.channel, song, {
                member: member,
                textChannel: interaction.channel
            })


            const songQueue = player.getQueue(interaction.guild.id).songs
            song = songQueue[songQueue.length-1]

            const embed = new EmbedBuilder()
                .setAuthor({name:"Added music to queue",iconURL:guild.iconURL()})
                .setTitle(song.name)
                .setURL(song.url)
                .setThumbnail(song.thumbnail)
                .setFooter({text:"Requested by " + member.displayName, iconURL: user.avatarURL()})
                .setDescription("Duration: " + song.formattedDuration)
                .setColor("#2268f5")

            await interaction.editReply({embeds:[embed]});

            return null;
        }

        return  {content:`You need to enter voice channel!`, ephemeral:true};
    },
    buttons:
    {
        pause : pause,
        play : play,
        previous : previous,
        pageDownQueue: pageDownQueue,
        pageUpQueue: pageUpQueue
    },
}

async function pause({interaction, player}) {
    player.getQueue(interaction.guild.id).pause()
    player.menu[interaction.guild.id].updateMenu()
    return {content: "Pause Music", ephemeral:true};
}

async function play({interaction, player}) {
    player.getQueue(interaction.guild.id).resume();
    player.menu[interaction.guild.id].updateMenu()
    return {content: "Resume Music", ephemeral:true};
}

async function previous({interaction, player}) {
    try{
        await player.getQueue(interaction.guild.id).previous();
        player.menu[interaction.guild.id].updateMenu()
        return {content: "Previous Music", ephemeral:true};
    }
    catch(x)
    {
        return {content: "Theres is no previous song", ephemeral:true};
    }
}

async function pageDownQueue(interaction, player)
{
    player.menu[interaction.guild.id].pageUp(player.getQueue(interaction.guild.id).songs)
}

async function pageUpQueue(interaction, player)
{
    player.menu[interaction.guild.id].pageDown(player.getQueue(interaction.guild.id).songs)
}


