
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
            const song = await player.search(interaction.options.getString("query"),
                {
                    limit: 1,
                    safeSearch: false
                });

            if(!player.menu[guild.id])
            {
                player.menu[guild.id] = new MusicMenu(guild, interaction.channel, player);
            }


            player.play(member.voice.channel, song[0], {
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
                .setColor("#2268f5")

            return {embeds:[embed]};
        }

        return  {content:`You need to enter voice channel!`, ephemeral:true};
    },
    buttons:
    {
        pause : pause,
        play : play,
        previous : previous,
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

