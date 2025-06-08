const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {

    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('🔎 → Permet aux membres du staff de donenr un avertissement écrit.')
        .addUserOption(option =>
            option
                .setName("utilisateur")
                .setDescription("Utilisateur à avertir")
                .setRequired(true)
        )
        .addStringOption(option => 
            option
                .setName("raiso")
                .setDescription("Raison de l'avertissement")
                .setRequired(true)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("utilisateur");
        const reason = interaction.options.getString("raison");
        const staffRoleId = process.env.STAFF_ROLE

        if(!user) {
            interaction.reply({ cotent: `Aïe, je ne parviens pas à trouver l'utilisateur que vous souhaitez avertir...`, flags: MessageFlags.Ephemeral })
        }

        if(!reason) {
            interaction.reply({ cotent: `Mh, j'aimerai bien que vous me fournissiez une raison pour cette sanction.`, flags: MessageFlags.Ephemeral })
        }

        if(!interaction.member.roles.cache.some(role => role.id === staffRoleId)) {
            await interaction.reply({ content: "Mh, c'est assez gênant... Je crains que vous n'ayez pas la permission de faire cela. 🙎", flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            
            const embed = new EmbedBuilder()
                .setDescription(`📢 → ${user.mention} a été avertis par ${interaction.user.mention} pour la raison : ${reason}`)
                .setColor(process.env.COLOR_ERROR)

            interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("⚠️ → Une erreur est survenue lors de l'avertissement d'un utilisateur : ", error);
            interaction.reply({ content: "Une erreur est survenue, c'est relou 😒", flags: MessageFlags.Ephemeral });
        }
    }
}