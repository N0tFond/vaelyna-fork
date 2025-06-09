const { SlashCommandBuilder, MessageFlags, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('🔎 → Permet d\'obtenir l\'accès complet au serveur.'),

    async execute(interaction) {
        const {
            MEMBER_ROLE: memberRoleId,
            NONVERIF_ROLE: nonVerifiedRoleId,
            BASICS_ROLE: basicsRoleId,
            BOOST_ROLE: boostRoleId,
            LEVELS_ROLE: levelsRoleId,
            NOTIFS_ROLE: notifsRoleId,
            HOMME_ROLE: boyRoleId,
            COLOR_ROLE: colorRoleId,
            FEMME_ROLE: girlRoleId,
            NONBINARIE_ROLE: nonBinaryRoleId,
            GENERAL_CHANNEL: welcomeChannel,
            COLOR_SUCCESS: successColor
        } = process.env;

        if (interaction.member.roles.cache.has(memberRoleId)) {
            return await interaction.reply({ 
                content: "Vous avez déjà été vérifié une première fois, je ne vois pas pourquoi le faire une seconde fois. 🤔", 
                flags: MessageFlags.Ephemeral 
            });
        }

        const genderOptions = [
            { label: 'Homme', description: 'Je suis un homme', value: 'homme', emoji: '👨', roleId: boyRoleId },
            { label: 'Femme', description: 'Je suis une femme', value: 'femme', emoji: '👩', roleId: girlRoleId },
            { label: 'Non-binaire', description: 'Je suis non-binaire', value: 'nonbinaire', emoji: '🧑', roleId: nonBinaryRoleId }
        ];

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('gender_select')
            .setPlaceholder('Choisissez votre sexe')
            .addOptions(genderOptions.map(({ label, description, value, emoji }) => ({ label, description, value, emoji })));

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: 'Pour finaliser votre vérification, veuillez sélectionner votre sexe :',
            components: [row],
            flags: MessageFlags.Ephemeral
        });

        const collector = interaction.channel.createMessageComponentCollector({
            filter: (i) => i.customId === 'gender_select' && i.user.id === interaction.user.id,
            time: 60000
        });

        collector.on('collect', async (i) => {
            const selectedGender = genderOptions.find(option => option.value === i.values[0]);
            
            try {
                const rolesToAdd = [memberRoleId, basicsRoleId, boostRoleId, levelsRoleId, notifsRoleId, colorRoleId, selectedGender.roleId];
                
                await Promise.all([
                    interaction.member.roles.add(rolesToAdd),
                    interaction.member.roles.remove(nonVerifiedRoleId)
                ]);

                const { user } = interaction.member;
                const avatarURL = user.displayAvatarURL({ format: 'png', size: 128 });
                const username = user.username;
                const memberCount = interaction.guild.memberCount;

                const embed = new EmbedBuilder()
                    .setAuthor({ name: username, iconURL: avatarURL })
                    .setColor(successColor)
                    .setTitle(`<:Pinkflower:1379030319071625247> Bienvenue sur le serveur, ${username} !`)
                    .setDescription(`- Pense à lire nos règles : <#1378581312172068976>\n- Tu peux te présenter dans le salon <#1378583912606863370>.\n- Si tu as des questions, un problème, n'hésite pas à te rendre dans le salon <#1378581147419807765>.`)
                    .setTimestamp()
                    .setImage('https://i.pinimg.com/originals/b3/4b/d0/b34bd0ef85660338e6082332e0d31a7f.gif')
                    .setFooter({ text: `Nous sommes désormais ${memberCount} sur le serveur.`, iconURL: avatarURL });

                const channel = interaction.guild.channels.cache.get(welcomeChannel);
                await channel.send({ embeds: [embed] });

                await i.update({
                    content: `✅ → Vous avez été vérifié avec succès en tant que ${selectedGender.label} !`,
                    components: []
                });
                
            } catch (error) {
                console.error(`⚠️ → Erreur lors de la vérification de ${interaction.user.username} :`, error);
                await i.update({
                    content: "Il s'est passé quelque chose d'assez gênant, je n'ai pas réussi à vous vérifier. Veuillez contacter un membre du staff...",
                    components: []
                });
            }
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                interaction.editReply({
                    content: '⏰ → Temps écoulé ! Veuillez relancer la commande.',
                    components: []
                });
            }
        });
    }
}