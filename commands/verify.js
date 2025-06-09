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
        const colorRoleId = process.env.COLOR_ROLE
        const girlRoleId = process.env.FEMME_ROLE
        const nonBinaryRoleId = process.env.NONBINARIE_ROLE
        const memberCount = interaction.guild.members.cache

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
                    await interaction.member.roles.add([memberRoleId, basicsRoleId, boostRoleId, levelsRoleId, notifsRoleId, colorRoleId, genderRoleId]);
                    await interaction.member.roles.remove(nonVerifiedRoleId);
                    
                    const welcomeChannel = process.env.GENERAL_CHANNEL;
                    const nonVerifiedRole = process.env.NONVERIF_ROLE;

                    const role = member.guild.roles.cache.get(nonVerifiedRole);
                    if (!role) {
                        console.error(`⚠️ → Le rôle avec l'ID ${nonVerifiedRole} n'existe pas dans le serveur.`);
                        return;
                    }

                    await member.roles.add(role).catch(err => {
                        console.error(`⚠️ → Impossible d'ajouter le rôle ${role.name} à l'utilisateur ${member.user.tag}.`, err);
                    });

                    console.log(`✅ → Le rôle ${role.name} a été ajouté à l'utilisateur ${member.user.tag}.`);
                    
                    const avatarURL = member.user.displayAvatarURL({ format: 'png', size: 128 }) || member.user.defaultAvatarURL;
                    const username = member.user.username || 'Utilisateur inconnu';

                    const embed = new Discord.EmbedBuilder()
                        .setAuthor({ name: username, iconURL: avatarURL })
                        .setColor(process.env.COLOR_SUCCESS)
                        .setTitle(`<:Pinkflower:1379030319071625247> Bienvenue sur le serveur, ${username} !`)
                        .setDescription(`- Pense à lire nos règles : <#1378581312172068976>\n- Tu peux te présenter dans le salon <#1378583912606863370>.\n- Si tu as des questions, un problème, n'hésite pas à te rendre dans le salon <#1378581147419807765>.`)
                        .setTimestamp()
                        .setImage('https://i.pinimg.com/originals/b3/4b/d0/b34bd0ef85660338e6082332e0d31a7f.gif')
                        .setFooter({ text: `Nous sommes désormais sur ${memberCount} le serveur.`, iconURL: avatarURL });

                    var channel = member.guild.channels.cache.get(welcomeChannel);
                    await channel.send({ embeds: [embed] });

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