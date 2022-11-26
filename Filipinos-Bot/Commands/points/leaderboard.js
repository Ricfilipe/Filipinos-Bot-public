const GambleDB = require('../../Modules/Connections/GambleDB');
const { MessageEmbed } = require('discord.js');

module.exports= {
    json: {
        "name": "leaderboard",
        "description": "Shows top 10 leaderboard",
        "options":[]
    },
    callback: async ({client, interaction, args, guild, member, user}) => {
        const pos = [":one:", ":two:", ":three:", ":four:", ":five:", ":six:", ":seven:", ":eight:", ":nine:", ":keycap_ten:"];
        const leaders = await GambleDB.top10();
        const space = "\u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B ";
        const embed = new MessageEmbed()
            .setColor('#d2c153')
            .setAuthor({name:"Leaderboard"})
            .setDescription("TOP 10");

        let last = -1;
        let jump = 1;
        let position = 0;
        for (let l of leaders) {
            if (last === -1) {
                last = l[1];
            } else if (last === l[1]) {
                jump += 1;
            } else if (last > l[1]) {
                position += jump;
                jump = 1;
            }
            embed.addField(pos[position] + " - " + l[0], space + l[1]);
            last = l[1];
        }
        return {embeds:[embed]}
    }
}