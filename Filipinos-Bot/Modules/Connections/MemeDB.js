const { MongoClient } = require('mongodb');
require('dotenv').config();

// Proteção com encodeURIComponent e valores por defeito para evitar erros se as variáveis falharem
const MONGO_USER = encodeURIComponent(process.env.MONGO_USER || '');
const MONGO_PASS = encodeURIComponent(process.env.MONGO_PASS || '');
const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@cluster0.daett.mongodb.net/?retryWrites=true&w=majority&authSource=admin`;

// Executa a criação do índice de forma segura (com try/finally para fechar a ligação)
createIndex();

async function createIndex() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        await client.db('Administration').collection('MemeDictionary').createIndex({ name: 1, guildId: 1 }, { unique: true });
    } catch (e) {
        console.error("Erro ao criar índice:", e);
    } finally {
        await client.close();
    }
}

module.exports = {
    newMemeTemplate: async function (id, name, guildID) {
        const client = new MongoClient(uri);
        let operationResult = false;
        try {
            await client.connect();
            let result = await client.db('Administration').collection('MemeDictionary').insertOne({
                id: id,
                name: name,
                guildID: guildID
            });
            if (result) {
                operationResult = true;
            }
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }

        return operationResult;
    },

    remMemeTemplate: async function (name, guildID) {
        const client = new MongoClient(uri);
        let operationResult = false;
        try {
            await client.connect();
            const result = await client.db('Administration').collection('MemeDictionary').deleteOne({ name: name, guildID: guildID });
            if (result.deletedCount > 0) {
                operationResult = true;
            }
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
        return operationResult;
    },

    listMemeTemplates: async function (guildID) {
        let list = new Map();
        const client = new MongoClient(uri);
        try {
            await client.connect();
            const result = await client.db('Administration').collection('MemeDictionary').find({ guildID: guildID }, { projection: { name: 1, id: 1 } });
            await result.forEach(k => list.set(k.name, k.id));
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
        return list;
    },

    getIdFromName: async function (name, guildID) {
        const client = new MongoClient(uri);
        let templateId = undefined;
        try {
            await client.connect();
            const result = await client.db('Administration').collection('MemeDictionary').findOne({ name: name, guildID: guildID });
            if (result) {
                templateId = result.id;
            }
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }

        return templateId;
    },
};