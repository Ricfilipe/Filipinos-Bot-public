const { MongoClient } = require('mongodb');
require('dotenv').config();

// Codificar para evitar problemas com caracteres especiais (como '@', '#', etc.)
const MONGO_USER = encodeURIComponent(process.env.MONGO_USER || '');
const MONGO_PASS = encodeURIComponent(process.env.MONGO_PASS || '');

const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@cluster0.daett.mongodb.net/Quotes?retryWrites=true&w=majority`;

module.exports = {
    newQuote: async function (id, name, quote, guildID) {
        const client = new MongoClient(uri);
        try {
            await client.connect();
            await client.db('Quotes').collection('Quotes').insertOne({
                id: id,
                name: name,
                quote: quote,
                guildID: guildID
            });
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    },

    getQuote: async function (id, guildID) {
        let quote = {};
        const client = new MongoClient(uri);
        try {
            await client.connect();
            const result = await client.db('Quotes').collection('Quotes').aggregate([
                { $match: { id: id, guildID: guildID } },
                { $sample: { size: 1 } }
            ]);
            await result.forEach(k => quote = [k.quote, k._id]);
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
        return quote;
    },

    remQuote: async function (id, guildID) {
        const client = new MongoClient(uri);
        try {
            await client.connect();
            // Nota: Dependendo da versão do driver do MongoDB, o método removeOne pode variar,
            // mas corrigi o erro de digitação de 'reuslt' para 'result'
            const result = await client.db('Quotes').collection('Quotes').deleteOne({ _id: id, guildID: guildID });
            if (result.deletedCount > 0) {
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    },

    listQuote: async function (id, guildID) {
        let list = new Map();
        const client = new MongoClient(uri);
        try {
            await client.connect();
            const result = await client.db('Quotes').collection('Quotes').find(
                { id: id, guildID: guildID },
                { projection: { _id: 1, quote: 1 } }
            );
            await result.forEach(k => list.set(k._id, k.quote));
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
        return list;
    }
};