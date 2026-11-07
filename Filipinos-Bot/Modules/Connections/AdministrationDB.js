const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_USER = encodeURIComponent(process.env.MONGO_USER || '');
const MONGO_PASS = encodeURIComponent(process.env.MONGO_PASS || '');
const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@cluster0.daett.mongodb.net/Administration?retryWrites=true&w=majority`;

module.exports = {
    createUpdate: async function (id, suf) {
        const client = new MongoClient(uri);
        try {
            await client.connect();
            await client.db('Administration').collection('Suffix').updateOne(
                { _id: id },
                { $set: { suf: suf } },
                { upsert: true }
            );
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    },

    getSuffix: async function (id) {
        const client = new MongoClient(uri);

        let suffix = null;

        try {
            await client.connect();
            const result = await client.db('Administration').collection('Suffix').findOne({
                _id: id,
            });
            if (result) {
                suffix = result.suf;
            }
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }

        return suffix; // Corrigido: Agora devolve corretamente o sufixo encontrado
    },

    addAdmin: async function (id) {
        const client = new MongoClient(uri);

        try {
            await client.connect();
            await client.db('Administration').collection('Admin').insertOne({
                _id: id,
            });
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    },

    removeAdmin: async function (id) {
        const client = new MongoClient(uri);

        try {
            await client.connect();
            // Corrigido de removeOne para deleteOne
            await client.db('Administration').collection('Admin').deleteOne({
                _id: id,
            });
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    },

    checkAdmin: async function (id) {
        const client = new MongoClient(uri);

        let result = false;

        try {
            await client.connect();
            // Corrigido: find() devolve um cursor, usamos findOne para verificar se o documento existe
            const adminDoc = await client.db('Administration').collection('Admin').findOne({ _id: id });
            result = !!adminDoc; // Transforma em booleano (true se existir, false se não)
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
        return result;
    },

    setAdminRole: async function (roleID, guildID) {
        const client = new MongoClient(uri);

        try {
            await client.connect();

            const query = { _id: guildID };
            const update = { $set: { _id: guildID, roleID: roleID } };
            const options = { upsert: true };

            await client.db('Administration').collection("AdminRoles").updateOne(query, update, options);
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    },

    getAdminRole: async function (guildID) {
        const client = new MongoClient(uri);

        try {
            await client.connect();

            const query = { _id: guildID };
            const result = await client.db('Administration').collection("AdminRoles").findOne(query);

            if (result) {
                return result.roleID;
            }
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }
};