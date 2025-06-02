const Discord = require('discord.js');
require('dotenv').config();

const guildUserJoin = (client) => {

    client.on('guildMemberAdd', async (member) => {
        try {
            const welcomeChannel = process.env.GENERAL_CHANNEL;
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
            
            const avatarURL = member.user.displayAvatarURL({ format: 'png', size: 128 }) || member.user.defaultAvatarURL;
            const username = member.user.username || 'Utilisateur inconnu';

            const embed = new Discord.EmbedBuilder()
                .setAuthor({ name: username, iconURL: avatarURL })
                .setColor(process.env.COLOR_SUCCESS)
                .setTitle(`<:Pinkflower:1379030319071625247> Bienvenue sur le serveur, ${username} !`)
                .setDescription(`- Pense à lire nos règles : <#1378581312172068976>\n- Tu peux te présenter dans le salon <#1378583912606863370>.\n- Si tu as des questions, un problème, n'hésite pas à te rendre dans le salon <#1378581147419807765>.`)
                .setTimestamp()
                .setImage('https://i.pinimg.com/originals/b3/4b/d0/b34bd0ef85660338e6082332e0d31a7f.gif')
                .setFooter({ text: "J'espère que tu t'amuseras bien ici !", iconURL: avatarURL });

            var channel = member.guild.channels.cache.get(welcomeChannel);
            await channel.send({ embeds: [embed] });


        } catch (error) {
            console.error('Erreur lors de l\'envoi du message de bienvenue:', error);
        }
    })
}

module.exports = guildUserJoin;