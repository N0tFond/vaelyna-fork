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

        if (type === 'normales') {
            const fields = [
                { name: 'Nom', value: user.tag, inline: true },
                { name: 'ID', value: user.id, inline: true },
                { name: 'Créé le', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false }
            ];
            if (member) {
                fields.push({ name: 'Arrivé sur le serveur', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false });
            }
            const embed = new EmbedBuilder()
                .setTitle(`Informations sur ${user.username}`)
                .setThumbnail(user.displayAvatarURL())
                .addFields(fields)
                .setColor('#5E7381')
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
            const warnsText = warns.length ? warns.map(w => `• ${w.reason} *(par ${w.author}, le ${w.date})*`).join('\n') : 'Aucun';
            const bansText = bans.length ? bans.map(b => `• ${b.reason} *(par ${b.author}, le ${b.date})*`).join('\n') : 'Aucun';
            const embed = new EmbedBuilder()
                .setTitle(`Infos serveur pour ${user.username}`)
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: 'Rôles', value: roles, inline: false },
                    { name: 'Warns', value: warnsText, inline: false },
                    { name: 'Bans', value: bansText, inline: false }
                )
                .setColor('#5E7381')
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        } catch (err) {
            return interaction.reply({ content: 'Erreur lors de la récupération des sanctions.', ephemeral: true });
        }
    }
};
