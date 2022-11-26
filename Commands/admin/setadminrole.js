const AdministrationDB = require('../../Modules/Connections/AdministrationDB');
const Admin = require('../../Modules/administration');


module.exports= {
    json: {
        "name": "setadminrole",
        "description": "Set a role as admin",
        "options":[   {
            "name": "role",
            "description": "Admin role",
            "type": 8,
            "required": true,
        }],
        "default_permission": false
    },
    callback: async ({client, interaction, args, guild, member, user}) => {
        if(user.id === Admin.botOwner || guild.ownerId === user.id){
            AdministrationDB.setAdminRole(args.getRole("role").id,guild.id);
            return {content:"admin role has been set"}
        }
        else
        {
            return {content:"You don't have permissions"}
        }


    }
}