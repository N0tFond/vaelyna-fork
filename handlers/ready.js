const { PresenceUpdateStatus } = require('discord.js');

const readyHandler = (client) => {

    client.once('ready', () => {

        client.user.setPresence({ activities: [{ name: 'https://github.com/qrlmza/vaelyna' }], status: PresenceUpdateStatus.Idle });

        console.log(`📡 → Connecté en tant que ${client.user.username}`);
    });
}

module.exports = readyHandler;