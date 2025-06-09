const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('🔎 → Permet aux membres du staff de bannir un membre.')
        .addUserOption(option =>
            option
                .setName('utilisateur')
                .setDescription('Utilisateur à bannir')
                .setRequired(true)
        )
        .addStringOption(option => 
            option 
                .setName('raison')
                .setDescription('Raison du bannissement')
                .setRequired(true)
        ),

    async execute(interaction) {
        const staffRoleId = process.env.STAFF_ROLE;
        
        if (!interaction.member.roles.cache.has(staffRoleId)) {
            return await interaction.reply({ 
                content: "Mh, c'est assez gênant... Je crains que vous n'ayez pas la permission de faire cela. 🙎", 
                flags: MessageFlags.Ephemeral 
            });
        }

        const targetUser = interaction.options.getUser('utilisateur');
        const baseReason = interaction.options.getString('raison');
        const fullReason = `${baseReason} → Banni par ${interaction.user.username}`;

        try {
            const member = await interaction.guild.members.fetch(targetUser.id);
            
            if (!member) {
                return await interaction.reply({ 
                    content: "Heum, je ne parviens pas à trouver l'utilisateur en question... C'est étrange tout de même. 🤔", 
                    flags: MessageFlags.Ephemeral 
                });
            }

            const memberUsername = member.user.username;

            await member.ban({ reason: fullReason });
            
            await interaction.reply({ 
                content: `🔨 → L'utilisateur ${memberUsername} a été banni par ${interaction.user.username} pour la raison : ${baseReason}!` 
            });
            
            console.log(`🔨 → ${interaction.user.username} a banni ${memberUsername} pour la raison suivante : ${fullReason}`);
            
        } catch (error) {
            console.error(`⚠️ → Erreur lors du bannissement :`, error);
            await interaction.reply({ 
                content: `⚠️ → Une erreur est survenue lors du bannissement de ${targetUser.username}...`, 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
}