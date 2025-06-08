const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('🔎 → Permet aux membres du staff de donner un avertissement écrit.')
        .addUserOption(option =>
            option
                .setName("utilisateur")
                .setDescription("Utilisateur à avertir")
                .setRequired(true)
        )
        .addStringOption(option => 
            option
                .setName("raison")
                .setDescription("Raison de l'avertissement")
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("utilisateur");
        const reason = interaction.options.getString("raison");
        const staffRoleId = process.env.STAFF_ROLE;

        if(!interaction.member.roles.cache.some(role => role.id === staffRoleId)) {
            await interaction.reply({ 
                content: "Mh, c'est assez gênant... Je crains que vous n'ayez pas la permission de faire cela. 🙎", 
                flags: MessageFlags.Ephemeral 
            });
            return;
        }

        try {
            const embed = new EmbedBuilder()
                .setDescription(`> 📢 → ${user} a été averti par ${interaction.user} pour la raison : *${reason}*`)
                .setColor(process.env.COLOR_ERROR);

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("⚠️ → Une erreur est survenue lors de l'avertissement d'un utilisateur : ", error);
            
            if (!interaction.replied) {
                await interaction.reply({ 
                    content: "Une erreur est survenue, c'est relou 😒",
                    flags: MessageFlags.Ephemeral 
                });
            }
        }
    }
}