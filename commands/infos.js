const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    
    data: new SlashCommandBuilder()
        .setName('infos')
        .setDescription('🔎 → Permet d\'obtenir les différentes informations sur le bot.'),

    async execute(interaction) {

        const version = require('../package.json').version;
        const developer = "<@855168612323164210>";
        const supportServer = "https://discord.gg/Z2PCkW64";
        const sourcecode = "https://github.com/qrlmza/vaelyna";
        
        const embed = new EmbedBuilder()
            .setColor(process.env.COLOR_INFO)
            .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
            .addFields(
                { name: '📁 Version', value: version, inline: true },
                { name: '🙎 Développeur', value: developer, inline: true },
                { name: '🎫 Serveur de support', value: supportServer, inline: true },
                { name: '🗃️ Code source', value: sourcecode, inline: true }
            )
            .setTimestamp()
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 1024 }));

        await interaction.reply({ embeds: [embed] });
    }
};
