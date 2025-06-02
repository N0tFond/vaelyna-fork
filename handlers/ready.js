// const { ActivityType } = require('discord.js');

const readyHandler = (client) => {

    client.once('ready', () => {

        console.log(`📡 → Connecté en tant que ${client.user.username}`);
    });
}

module.exports = readyHandler;