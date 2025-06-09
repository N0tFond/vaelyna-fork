const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../db');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('🔎 → Affiche les informations sur un utilisateur.')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Utilisateur à consulter')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type d\'informations à afficher')
                .setRequired(true)
                .addChoices(
                    { name: 'Normales', value: 'normales' },
                    { name: 'Serveur', value: 'server' }
                )
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('utilisateur');
        const type = interaction.options.getString('type');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        const accentColor = '#A259E6';
        const infoColor = '#5E7381';
        const warnColor = '#FFBF18';
        const banColor = '#D12128';

        if (type === 'normales') {
            const fields = [
                { name: '👤 Nom', value: `	${user.tag}`, inline: true },
                { name: '🆔 ID', value: `	${user.id}`, inline: true },
                { name: '📅 Créé le', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false }
            ];
            if (member) {
                fields.push({ name: '📥 Arrivé sur le serveur', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false });
            }
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Informations sur ${user.username}`, iconURL: user.displayAvatarURL() })
                .setThumbnail(user.displayAvatarURL())
                .addFields(fields)
                .setColor(accentColor)
                .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        // type === 'server'
        try {
            const [[warns], [bans]] = await Promise.all([
                db.query('SELECT * FROM warns WHERE user = ?', [user.tag]),
                db.query('SELECT * FROM bans WHERE user = ?', [user.tag])
            ]);
            const roles = member ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `<@&${r.id}>`).join(', ') || 'Aucun' : 'Aucun';
            const warnsText = warns.length ? warns.map(w => `- **${w.reason}**\n> par ${w.author} le ${new Date(w.date).toLocaleDateString('fr-FR')}`).join('\n\n') : 'Aucun';
            const bansText = bans.length ? bans.map(b => `- **${b.reason}**\n> par ${b.author} le ${new Date(b.date).toLocaleDateString('fr-FR')}`).join('\n\n') : 'Aucun';
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Server info for ${user.username}`, iconURL: user.displayAvatarURL() })
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: '🎭 Rôles', value: roles, inline: false },
                    { name: '⚠️ Warns', value: warnsText, inline: false },
                    { name: '🔨 Bans', value: bansText, inline: false }
                )
                .setColor(infoColor)
                .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        } catch (err) {
            return interaction.reply({ content: 'Erreur lors de la récupération des sanctions.', ephemeral: true });
        }
    }
};
