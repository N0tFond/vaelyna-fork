const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {

        // Gestion des commandes slash
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`⚠️ → Aucune commande correspondant à ${interaction.commandName} n'a été trouvée.`);
                return;
            }

            try {
                await command.execute(interaction);
                console.log(`💬 → L'utilisateur ${interaction.user.username} à utilisé la commande /${interaction.commandName}.`);
            } catch (error) {
                console.error('⚠️ → Erreur lors de l\'exécution de la commande : ', error);

                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: "Une erreur s'est produite lors de l'exécution de cette commande.",
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    await interaction.followUp({
                        content: "Une erreur s'est produite lors de l'exécution de cette commande.",
                        flags: MessageFlags.Ephemeral
                    });
                }
            }
        }

        // Gestion des boutons
        if (interaction.isButton()) {
            try {
                // Bouton de fermeture de ticket
                if (interaction.customId === 'close_ticket') {
                    const channel = interaction.channel;
                    const user = interaction.user;

                    // Vérifier que c'est bien un salon de ticket
                    if (!channel.name.startsWith('ticket-')) {
                        return interaction.reply({ 
                            content: '❌ Cette commande ne peut être utilisée que dans un ticket.', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }

                    // Vérifier les permissions (seul le créateur du ticket ou le staff peuvent fermer)
                    const ticketOwnerName = channel.name.replace('ticket-', '');
                    const isTicketOwner = user.username.toLowerCase() === ticketOwnerName;
                    const isStaff = process.env.STAFF_ROLE && interaction.member.roles.cache.has(process.env.STAFF_ROLE);

                    if (!isTicketOwner && !isStaff) {
                        return interaction.reply({ 
                            content: '❌ Vous n\'avez pas la permission de fermer ce ticket.', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }

                    // Embed de confirmation
                    const confirmEmbed = new EmbedBuilder()
                        .setColor(process.env.COLOR_WARN || '#FFBF18')
                        .setDescription('⚠️ **Êtes-vous sûr de vouloir fermer ce ticket ?**\n\n🗑️ *Cette action supprimera définitivement le salon*')
                        .setFooter({ text: '⏱️ Le ticket sera supprimé 5 secondes après confirmation' });

                    // Boutons de confirmation
                    const confirmButtons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('confirm_close')
                                .setLabel('✅ Confirmer')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId('cancel_close')
                                .setLabel('❌ Annuler')
                                .setStyle(ButtonStyle.Secondary)
                        );

                    await interaction.reply({
                        embeds: [confirmEmbed],
                        components: [confirmButtons]
                    });

                    console.log(`🎫 → ${user.username} demande la fermeture du ticket ${channel.name}`);
                }

                // Confirmation de fermeture
                else if (interaction.customId === 'confirm_close') {
                    const channel = interaction.channel;
                    const user = interaction.user;

                    // Embed de fermeture
                    const closingEmbed = new EmbedBuilder()
                        .setColor(process.env.COLOR_SUCCESS || '#90955C')
                        .setDescription(`🔒 **Ticket fermé par ${user}**\n\n⏰ **Fermé :** <t:${Math.floor(Date.now() / 1000)}:R>\n🗑️ *Suppression automatique dans 5 secondes...*`);

                    await interaction.update({
                        embeds: [closingEmbed],
                        components: []
                    });

                    console.log(`🔒 → Ticket ${channel.name} fermé par ${user.username} (${user.id})`);

                    // Supprimer le salon après 5 secondes
                    setTimeout(async () => {
                        try {
                            await channel.delete('Ticket fermé');
                            console.log(`🗑️ → Ticket ${channel.name} supprimé automatiquement`);
                        } catch (error) {
                            console.error('⚠️ → Erreur lors de la suppression du ticket:', error);
                        }
                    }, 5000);
                }

                // Annulation de fermeture
                else if (interaction.customId === 'cancel_close') {
                    const user = interaction.user;
                    
                    const cancelEmbed = new EmbedBuilder()
                        .setColor(process.env.COLOR_INFO || '#5E7381')
                        .setDescription('↩️ **Fermeture annulée**\n\n*Le ticket reste ouvert*');

                    await interaction.update({
                        embeds: [cancelEmbed],
                        components: []
                    });

                    console.log(`↩️ → ${user.username} a annulé la fermeture du ticket`);

                    // Remettre le bouton de fermeture après 3 secondes
                    setTimeout(async () => {
                        const closeButton = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('close_ticket')
                                    .setLabel('🔒 Fermer le ticket')
                                    .setStyle(ButtonStyle.Danger)
                            );

                        try {
                            await interaction.editReply({
                                embeds: [],
                                components: [closeButton],
                                content: '🔒 *Vous pouvez fermer le ticket quand vous le souhaitez*'
                            });
                        } catch (error) {
                            console.error('⚠️ → Erreur lors de la restauration du bouton:', error);
                        }
                    }, 3000);
                }

            } catch (error) {
                console.error('⚠️ → Erreur lors de la gestion du bouton:', error);
                
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: "Une erreur s'est produite lors du traitement de cette action.",
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    await interaction.followUp({
                        content: "Une erreur s'est produite lors du traitement de cette action.",
                        flags: MessageFlags.Ephemeral
                    });
                }
            }
        }
    },
};