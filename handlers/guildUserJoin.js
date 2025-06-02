const Discord = require('discord.js');

const guildUserJoin = (client) => {

    client.on('guildMemberAdd', async (member) => {
        try {
            const welcomeChannel = process.env.GENERAL_CHANNEL;
            
            const avatarURL = member.user.displayAvatarURL({ format: 'png', size: 128 }) || member.user.defaultAvatarURL;
            const username = member.user.username || 'Utilisateur inconnu';

            const embed = new Discord.EmbedBuilder()
                .setAuthor({ name: username, iconURL: avatarURL })
                .setColor(process.env.COLOR_SUCCESS)
                .setDescription(`**Bienveillanceㅤ┊ㅤㅤ┊ㅤㅤ┊ㅤㅤ♡ㅤㅤㅤㅤ┊ㅤ┊ㅤㅤㅤ┊ㅤㅤㅤㅤ┊ㅤㅤㅤㅤ˚  ♡ ┊ㅤㅤㅤ┊ㅤㅤ♡ㅤㅤ⋆ㅤㅤㅤ+ ♡ㅤㅤ⋆  ㅤ┊ㅤㅤ.ㅤㅤ+ㅤㅤ♡** \nBienvenue ${member.user} \nn'oublie pas d'aller prendre tes rôles <#1377009194271641744> \n\n\n♥︎\n⇄ ◁◁ 𝚰𝚰 ▷▷ ↻\n⁰⁰'²⁵ ━━●━━───── ⁰²'⁰⁸`)
                .setTimestamp()
                .setImage('https://media.discordapp.net/attachments/985839018665201687/1378503379667648594/welcome.gif?ex=683cd6d1&is=683b8551&hm=c8fc3f2e1e660d3f411d0d58ff74ef927f97dc46cccaf8be0bb3dba101b4e631&=')
                .setFooter({ text: "J'espère que tu t'amuseras bien ici !", iconURL: avatarURL });

            var channel = member.guild.channels.cache.get(welcomeChannel);
            await channel.send({ embeds: [embed] });


        } catch (error) {
            console.error('Erreur lors de l\'envoi du message de bienvenue:', error);
        }
    })
}

module.exports = guildUserJoin;