const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');

module.exports =class MusicMenu{
    constructor(guild, textChannel, player) {
        this.guild = guild;
        this.textChannel = textChannel
        this.player = player
    };

    cleanUp()
    {
        if(this.message)
        {
            this.message.delete()
        }
    }

    async createMenu()
    {
        const queue = this.player.getQueue(this.guild.id)
        const queuedSongs = queue.songs
        if(queuedSongs.length > 0)
        {
            const embed = this.generateEmbed(queuedSongs)
            const row = this.generateAction(queue)
            this.message = await this.textChannel.send({embeds: [embed], components:[row]})
        }
    }

    async updateMenu()
    {
        console.log("updating menu")
        const queue = this.player.getQueue(this.guild.id)
        const queuedSongs = queue.songs
        if(queuedSongs.length > 0)
        {
            const embed = this.generateEmbed(queuedSongs)
            const row = this.generateAction(queue)
            this.message.edit({embeds: [embed], components:[row]})
        }
        else
        {

        }
    }

     generateEmbed(queuedSongs)
    {
        return new EmbedBuilder()
            .setColor("#2268f5")
            .setTitle('Currently Playing')
            .setDescription("["+ queuedSongs[0].name+ "]("+ queuedSongs[0].url + ")")
            .setThumbnail(queuedSongs[0].thumbnail)
            .addFields(
                { name: 'Requested by', value: queuedSongs[0].member.displayName,  inline: true  },
                { name: 'Duration', value: queuedSongs[0].formattedDuration ,  inline: true },
                { name: 'In Queue', value: ""+queuedSongs.length,  inline: true }
            )
    }

     generateAction(queue)
    {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel('⏮ Previous')
                .setStyle(ButtonStyle.Secondary),
            )

        if(queue.paused)
        {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('play')
                    .setLabel('▶ Play')
                    .setStyle(ButtonStyle.Primary),
            )
        }
        else
        {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('pause')
                    .setLabel('⏸ Pause')
                    .setStyle(ButtonStyle.Secondary),
            )
        }

        row.addComponents(
                new ButtonBuilder()
                    .setCustomId('skip')
                    .setLabel('⏭ Skip')
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('stop')
                    .setLabel('⏹ STOP')
                    .setStyle(ButtonStyle.Danger),
            )
        return row
    }
}