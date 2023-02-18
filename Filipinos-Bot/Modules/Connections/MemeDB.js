const { MongoClient } = require('mongodb');
require('dotenv').config();
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASS = process.env.MONGO_PASS;
const uri = 'mongodb+srv://'+MONGO_USER+':'+ MONGO_PASS +'@cluster0.daett.mongodb.net/Administration?retryWrites=true&w=majority';

createIndex()

async function createIndex()
{
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    await client.connect();
    await client.db('Administration').collection('MemeDictionary').createIndex( { name: 1, guildId: 1}, { unique: true } )
}


module.exports={
    newMemeTemplate: async function (id,name,guildID){
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        let operationResult = false
        try {
            await  client.connect();
            let result = await client.db('Administration').collection('MemeDictionary').insertOne({
                id: id,
                name: name,
                guildID:guildID
            });
            if(result)
            {
                operationResult = true
            }
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }

        return operationResult
    },

    remMemeTemplate: async function (name,guildID){
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        let operationResult = false
        try {
            await  client.connect();
            const result = await client.db('Administration').collection('MemeDictionary').removeOne({name:name,guildID: guildID});
            if(result){
                operationResult = true
            }
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
        return operationResult

    },

    listMemeTemplates: async function (guildID){
        let list= new Map();
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        try {
            await  client.connect();
            const result = await client.db('Administration').collection('MemeDictionary').find({guildID:guildID}, { projection: {name:1, id: 1 }});
            await result.forEach(k=>list.set(k.name,k.id));
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
        return list;

    },

    getIdFromName: async function (name,guildID){

        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        let templateId = undefined
        try {
            await  client.connect();
            const result = await client.db('Administration').collection('MemeDictionary').findOne({name:name,guildID: guildID});
            if(result){
                templateId = result.id
            }

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }

        return templateId
    },


}
