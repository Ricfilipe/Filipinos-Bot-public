const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');

module.exports =class MusicMenu{
    constructor(guild, textChannel, player) {
        this.guild = guild;
        this.textChannel = textChannel
        this.player = player
        this.page = 1
        this.songPerPage = 10
    };

    cleanUp()
    {
        if(this.messageMenu)
        {
            this.messageMenu.delete()
            this.messageQueue.delete()
        }
    }

    async createMenu()
    {
        const queue = this.player.getQueue(this.guild.id)
        const queuedSongs = queue.songs
        if(queuedSongs.length > 0)
        {
            const embedMenu = this.generateEmbed(queuedSongs)
            const rowMenu = this.generateAction(queue)
            this.messageMenu = await this.textChannel.send({embeds: [embedMenu], components:[rowMenu]})

            const embedQueue = this.genreteQueue(queuedSongs)
            const rowQueue = this.generateQueueAction(queue)
            this.messageQueue = await this.textChannel.send({embeds: [embedQueue], components:[rowQueue]})
        }
    }

    async updateMenu()
    {
        console.log("updating menu")
        const queue = this.player.getQueue(this.guild.id)
        const queuedSongs = queue.songs
        if(queuedSongs.length > 0)
        {
            if(this.messageMenu)
            {
                const embed = this.generateEmbed(queuedSongs)
                const row = this.generateAction(queue)
                this.messageMenu.edit({embeds: [embed], components:[row]})
            }


            //Automatically go up a page when songs are removed
            while((this.page-1) * this.songPerPage > queuedSongs.length)
            {
                this.page--
            }

            if(this.messageQueue) {
                const embedQueue = this.genreteQueue(queuedSongs)
                const rowQueue = this.generateQueueAction(queuedSongs)
                this.messageQueue.edit({embeds: [embedQueue], components: [rowQueue]})
            }
        }
        else
        {

        }
    }

     generateEmbed(queuedSongs)
    {
        return new EmbedBuilder()
            .setColor("#2268f5")
            .setTitle(':musical_note: Currently Playing:')
            .setDescription("[`"+ queuedSongs[0].name+ "`]("+ queuedSongs[0].url + ")")
            .setThumbnail(queuedSongs[0].thumbnail)
            .addFields(
                { name: 'Requested by', value: "`"+queuedSongs[0].member.displayName+"`",  inline: true  },
                { name: 'Duration', value: "`"+queuedSongs[0].formattedDuration+"`" ,  inline: true },
                { name: 'In Queue', value: "`"+queuedSongs.length+"`",  inline: true }
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

    genreteQueue(queuedSongs)
    {
        let songsNames = []
        let requester = []
        let duration = []

        for (let i = (this.page-1)*this.songPerPage ; i<=this.page*this.songPerPage && i<queuedSongs.length; i++)
        {
            songsNames.push("[`"+ queuedSongs[i].name+ "`]("+ queuedSongs[i].url + ")")
            requester.push("`"+queuedSongs[i].member.displayName+"`")
            duration.push("`"+queuedSongs[i].formattedDuration+"`")
        }

        return new EmbedBuilder()
            .setColor("#2268f5")
            .setTitle('Songs Queued:')
            .addFields(
                { name: 'Song', value: songsNames.join("\n"),  inline: true  },
                { name: 'Requested by', value: requester.join("\n") ,  inline: true },
                { name: 'Duration', value: duration.join("\n"),  inline: true }
            )
            .setFooter({ text: "Page " + this.page + "/"+ Math.ceil(queuedSongs.length/this.songPerPage)})
    }

    generateQueueAction(queuedSongs)
    {
        const numberOfSongs = queuedSongs.length
        const row = new ActionRowBuilder()

        if(numberOfSongs > this.songPerPage && this.page*this.songPerPage > numberOfSongs) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('pageUpQueue')
                    .setLabel('▲')
                    .setStyle(ButtonStyle.Primary),
            )
        }
        else
        {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('pageUpQueue')
                    .setLabel('▲')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            )
        }

        if(numberOfSongs > this.songPerPage && this.page*this.songPerPage < numberOfSongs) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('pageDownQueue')
                    .setLabel('▼')
                    .setStyle(ButtonStyle.Primary),
            )
        }
        else
        {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('pageDownQueue')
                    .setLabel('▼')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            )
        }

        return row
    }

    pageDown(queuedSongs)
    {
        if((this.page) * this.songPerPage < queuedSongs.length)
        {
            this.page++
            const embedQueue = this.genreteQueue(queuedSongs)
            const rowQueue = this.generateQueueAction(queuedSongs)
            this.messageQueue.edit({embeds: [embedQueue], components:[rowQueue]})
        }
    }

    pageUp(queuedSongs)
    {
        if(this.page > 1)
        {
            this.page--
            const embedQueue = this.genreteQueue(queuedSongs)
            const rowQueue = this.generateQueueAction(queuedSongs)
            this.messageQueue.edit({embeds: [embedQueue], components:[rowQueue]})
        }
    }
}