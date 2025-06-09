const Discord = require('discord.js');
require('dotenv').config();

const guildUserJoin = (client) => {

    client.on('guildMemberAdd', async (member) => {
        const nonVerifiedRole = process.env.NONVERIF_ROLE;

        const role = member.guild.roles.cache.get(nonVerifiedRole);
        if (!role) {
            console.error(`⚠️ → Le rôle avec l'ID ${nonVerifiedRole} n'existe pas dans le serveur.`);
            return;
        }

        await member.roles.add(role).catch(err => {
            console.error(`⚠️ → Impossible d'ajouter le rôle ${role.name} à l'utilisateur ${member.user.tag}.`, err);
        });

        console.log(`✅ → Le rôle ${role.name} a été ajouté à l'utilisateur ${member.user.tag}.`);
    })
}

module.exports = guildUserJoin;