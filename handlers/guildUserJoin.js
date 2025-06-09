const Discord = require('discord.js');
require('dotenv').config();

const guildUserJoin = (client) => {

    client.on('guildMemberAdd', async (member) => {
        // Script déplacé dans ../commands/verify.js - Eviter l'affichage de membres qui leave directement avant la verif
    })
}

module.exports = guildUserJoin;