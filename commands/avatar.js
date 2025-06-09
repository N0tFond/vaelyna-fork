const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('🔎 → Permet d\'obtenir l\'avatar d\'un utilisateur.')
        .addUserOption(option => 
            option
                .setName('utilisateur')
                .setDescription('Utilisateur cible')
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
        const avatarURL = targetUser.displayAvatarURL({ size: 1024, dynamic: true });

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: interaction.user.username, 
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setImage(avatarURL)
            .setColor(process.env.COLOR_INFO)
            .setTimestamp()
            .setFooter({ 
                text: `🙎 → Voici l'avatar de ${targetUser.username}`, 
                iconURL: avatarURL 
            });

        await interaction.reply({ embeds: [embed] });
    }
}