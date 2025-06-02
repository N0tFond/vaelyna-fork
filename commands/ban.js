const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('🔎 → Permet aux membres du staff de bannir un membre.')
        .addUserOption(option =>
            option
                .setName("utilisateur")
                .setDescription("Utilisateur à bannir")
                .setRequired(true)
        )
        .addStringOption(option => 
            option 
                .setName("raison")
                .setDescription("Raison du bannissement")
                .setRequired(true)
        ),

    async execute(interaction) {

        const staffRoleId = process.env.STAFF_ROLE

        const user = interaction.options.getUser("utilisateur");
        const reason = interaction.options.getString("raison") + ` → Banni par ${interaction.user.username}`;
        const member = await interaction.guild.members.fetch(user.id)
        let memberUsername = member.user.username

        if(!interaction.member.roles.cache.some(role => role.id === staffRoleId)) {
            await interaction.reply({ content: "Mh, c'est assez gênant... Je crains que vous n'ayez pas la permission de faire cela. 🙎", flags: MessageFlags.Ephemeral });
            return;
        }

        if(!member) {
            await interaction.reply({ content: "Heum, je ne parviens pas à trouver l'utilisateur en questions... C'est étrange tout de même. 🤔", flags: MessageFlags.Ephemeral });
            return;
        }

        if(!reason) {
            await interaction.reply({ content: "Il serait tout de même interessant de fournir une raison pour bannir cet utilisateur. 🙎", flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            
            await member.ban({ reason: reason });
            await interaction.reply({ content: `🔨 → l'utilisateur ${memberUsername} a été banni par ${interaction.user.username} pour la raison ${reason}!` });
            console.log(`🔨 → ${interaction.user.username} a banni ${memberUsername} pour la raison suivante : ${reason}`);
        } catch (error) {
            console.error(`⚠️ → Une erreur est survenue lors du bannissement de ${memberUsername} : `, error);
            await interaction.reply({ content: `⚠️ → Une erreur est survenue lors ce que j'ai essayé de bannir ${memberUsername}...`, flags: MessageFlags.Ephemeral });
        }
    }
}