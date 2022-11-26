const { MongoClient } = require('mongodb');
require('dotenv').config();
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASS = process.env.MONGO_PASS;
const uri = 'mongodb+srv://'+MONGO_USER+':'+ MONGO_PASS +'@cluster0.daett.mongodb.net/Administration?retryWrites=true&w=majority';

module.exports = { createUpdate: async function (id,suf){
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        try {
            await  client.connect();
            await client.db('Administration').collection('Suffix').updateOne({_id: id},
                {$set: {suf: suf}},{ upsert: true });
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }

    },
    getSuffix: async function (id){
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        let suffix = null;

        try {
            await  client.connect();
            const result = await client.db('Administration').collection('Suffix').findOne({
                _id: id,
            });
            if(result) {
                suffix = result.suf;
            }

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }

    },
    addAdmin: async function (id){
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        try {
            await  client.connect();
           await client.db('Administration').collection('Admin').insertOne({
                _id: id,
            });

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }

    },    removeAdmin: async function (id){
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });



        try {
            await  client.connect();
             await client.db('Administration').collection('Admin').removeOne({
                _id: id,
            });


        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }

    },    checkAdmin: async function (id){
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        let result = false;

        try {
            await  client.connect();
            result = await client.db('Administration').collection('Admin').find({_id: id}) >0;


        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
        return result;
    },
    setAdminRole: async function(roleID, guildID){
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        try {
            await  client.connect();

            const query = { _id: guildID };
            const update = { $set: { _id: guildID, roleID: roleID }};
            const options = { upsert: true };

            await client.db('Administration').collection("AdminRoles").updateOne(query, update, options);

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    },
   getAdminRole: async function( guildID){
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        try {
            await  client.connect();

            const query = { _id: guildID };



            const result = await client.db('Administration').collection("AdminRoles").findOne(query);

            if(result) {
                return result.roleID
            }

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }

}



