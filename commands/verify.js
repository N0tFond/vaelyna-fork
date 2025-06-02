const { SlashCommandBuilder, MessageFlags, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {

    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('🔎 → Permet d\'obtenir l\'accès complet au serveur.'),

    async execute(interaction) {

        const memberRoleId = process.env.MEMBER_ROLE
        const nonVerifiedRoleId = process.env.NONVERIF_ROLE
        const basicsRoleId = process.env.BASICS_ROLE
        const boostRoleId = process.env.BOOST_ROLE
        const levelsRoleId = process.env.LEVELS_ROLE
        const notifsRoleId = process.env.NOTIFS_ROLE
        const boyRoleId = process.env.HOMME_ROLE
        const girlRoleId = process.env.FEMME_ROLE
        const nonBinaryRoleId = process.env.NONBINARIE_ROLE

        if(interaction.member.roles.cache.some(role => role.id === memberRoleId)) {
            await interaction.reply({ content: "Vous avez déjà été vérifié une première fois, je ne vois pas pourquoi le faire une seconde fois. 🤔", flags: MessageFlags.Ephemeral });
            return
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('gender_select')
            .setPlaceholder('Choisissez votre sexe')
            .addOptions([
                {
                    label: 'Homme',
                    description: 'Je suis un homme',
                    value: 'homme',
                    emoji: '👨'
                },
                {
                    label: 'Femme',
                    description: 'Je suis une femme',
                    value: 'femme',
                    emoji: '👩'
                },
                {
                    label: 'Non-binaire',
                    description: 'Je suis non-binaire',
                    value: 'nonbinaire',
                    emoji: '🧑'
                }
            ]);

        const row = new ActionRowBuilder()
            .addComponents(selectMenu);

        await interaction.reply({
            content: 'Pour finaliser votre vérification, veuillez sélectionner votre sexe :',
            components: [row],
            flags: MessageFlags.Ephemeral
        });

        const filter = (i) => i.customId === 'gender_select' && i.user.id === interaction.user.id;

        try {
            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: 60000
            });

            collector.on('collect', async (i) => {
                let genderRoleId;
                let genderLabel;

                switch(i.values[0]) {
                    case 'homme':
                        genderRoleId = boyRoleId;
                        genderLabel = 'Homme';
                        break;
                    case 'femme':
                        genderRoleId = girlRoleId;
                        genderLabel = 'Femme';
                        break;
                    case 'nonbinaire':
                        genderRoleId = nonBinaryRoleId;
                        genderLabel = 'Non-binaire';
                        break;
                }

                try {
                    await interaction.member.roles.add([memberRoleId, basicsRoleId, boostRoleId, levelsRoleId, notifsRoleId, genderRoleId]);
                    await interaction.member.roles.remove(nonVerifiedRoleId);
                    
                    await i.update({
                        content: `✅ → Vous avez été vérifié avec succès en tant que ${genderLabel} !`,
                        components: []
                    });
                    
                } catch (error) {
                    console.error(`⚠️ → Une erreur est survenue lors de la vérification de ${interaction.user.username} : `, error);
                    await i.update({
                        content: "Mh, Il s'est passé quelque chose d'assez gênant je n'ai pas réussi à vous vérifier, veuillez contacter un membre du staff...",
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

        } catch (error) {
            console.error(`⚠️ → Une erreur est survenue lors de la vérification de ${interaction.user.username} : `, error);
            await interaction.editReply({
                content: "Mh, Il s'est passé quelque chose d'assez gênant je n'ai pas réussi à vous vérifier, veuillez contacter un membre du staff...",
                components: []
            });
        }
    }
}