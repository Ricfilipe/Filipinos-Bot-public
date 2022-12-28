const { EmbedBuilder } = require('discord.js');
const AdministrationDB = require('./Connections/AdministrationDB');

const owner = '136894756985896960';

module.exports ={
    commands: async function admin(msg,suf){
        if (msg.content.startsWith(suf+'adminadd')){
            if (!msg.mentions.users.size){
                msg.reply('Please tag a valid user!');
            }else {
                this.checkAdmin(msg.author.id).then(value => {
                    if (value) {
                            const taggedUser = msg.mentions.users.first();
                            AdministrationDB.addAdmin(taggedUser.id);
                             msg.channel.send('Added '+ taggedUser.tag + ' as administrator');
                    } else {
                        msg.channel.send("You don't have permissions :)");
                    }
                });
            }

        } else if (msg.content.startsWith(suf+'adminremove')){
            if (!msg.mentions.users.size){
                msg.reply('Please tag a valid user!');
            }else {
                this.checkAdmin(msg.author.id).then(value => {
                    if (value) {
                            const taggedUser = msg.mentions.users.first();
                            AdministrationDB.removeAdmin(taggedUser.id);
                            msg.channel.send('Removed '+ taggedUser.tag + ' as administrator');

                    } else {
                        msg.channel.send("You don't have permissions :)");
                    }
                });

            }

        }
    },
    checkAdmin: async function checkadmin(id) {
        if (owner === id || await AdministrationDB.checkAdmin(id)) {
            return true
        } else {
            return false;
        }

    },
    checkServerAdmin: async function checkadmin(id, member, guildId) {
        return (owner === id || member.roles.cache.find(r => r.id === AdministrationDB.getAdminRole(guildId)))
    },
    botOwner: owner

}