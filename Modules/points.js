

const { MessageEmbed } = require('discord.js');

module.exports = function getPoints( msg ){
    if (msg.content.startsWith('!points')) {

        const id= msg.member.id;
        msg.channel.send(`You have ${pointsStorage.get(id)} points`);
    }

};