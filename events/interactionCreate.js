const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {

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

        if (interaction.isButton()) {
            try {
                if (interaction.customId === 'close_ticket') {
                    const channel = interaction.channel;
                    const user = interaction.user;

                    if (!channel.name.startsWith('ticket-')) {
                        return interaction.reply({ 
                            content: '❌ Cette commande ne peut être utilisée que dans un ticket.', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }

                    const ticketOwnerName = channel.name.replace('ticket-', '');
                    const isTicketOwner = user.username.toLowerCase() === ticketOwnerName;
                    const isStaff = process.env.STAFF_ROLE && interaction.member.roles.cache.has(process.env.STAFF_ROLE);

                    if (!isTicketOwner && !isStaff) {
                        return interaction.reply({ 
                            content: '❌ Vous n\'avez pas la permission de fermer ce ticket.', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }

                    const confirmEmbed = new EmbedBuilder()
                        .setColor(process.env.COLOR_WARN || '#FFBF18')
                        .setTitle('⚠️ Confirmation de fermeture')
                        .setDescription('Êtes-vous sûr de vouloir fermer ce ticket ?\n**Cette action est irréversible.**')
                        .setFooter({ text: 'Le ticket sera supprimé dans 5 secondes après confirmation.' })
                        .setTimestamp();

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

                else if (interaction.customId === 'confirm_close') {
                    const channel = interaction.channel;
                    const user = interaction.user;

                    const closingEmbed = new EmbedBuilder()
                        .setColor(process.env.COLOR_SUCCESS || '#90955C')
                        .setTitle('🔒 Ticket fermé')
                        .setDescription(`Ticket fermé par ${user}`)
                        .addFields(
                            { name: '📅 Fermé le', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        )
                        .setTimestamp();

                    await interaction.update({
                        embeds: [closingEmbed],
                        components: []
                    });

                    console.log(`🔒 → Ticket ${channel.name} fermé par ${user.username} (${user.id})`);

                    setTimeout(async () => {
                        try {
                            await channel.delete('Ticket fermé');
                            console.log(`🗑️ → Ticket ${channel.name} supprimé automatiquement`);
                        } catch (error) {
                            console.error('⚠️ → Erreur lors de la suppression du ticket:', error);
                        }
                    }, 5000);
                }

                else if (interaction.customId === 'cancel_close') {
                    const user = interaction.user;
                    
                    const cancelEmbed = new EmbedBuilder()
                        .setColor(process.env.COLOR_INFO || '#5E7381')
                        .setTitle('ℹ️ Fermeture annulée')
                        .setDescription('La fermeture du ticket a été annulée.')
                        .setTimestamp();

                    await interaction.update({
                        embeds: [cancelEmbed],
                        components: []
                    });

                    console.log(`↩️ → ${user.username} a annulé la fermeture du ticket`);

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
                                content: 'Vous pouvez de nouveau fermer le ticket si nécessaire.'
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

        if (interaction.isStringSelectMenu()) {
            try {
                if (interaction.customId === 'help_command_select') {
                    const selectedCommand = interaction.values[0];
                    const command = interaction.client.commands.get(selectedCommand);

                    if (!command) {
                        return interaction.reply({
                            content: '❌ Commande introuvable.',
                            flags: MessageFlags.Ephemeral
                        });
                    }

                    const detailEmbed = new EmbedBuilder()
                        .setColor(process.env.COLOR_INFO || '#5E7381')
                        .setTitle(`📖 Détails - \`/${command.data.name}\``)
                        .setDescription(command.data.description || 'Aucune description disponible')
                        .setTimestamp();

                    if (command.data.options && command.data.options.length > 0) {
                        const optionsText = command.data.options.map(option => {
                            const required = option.required ? '🔴 **Requis**' : '🟢 **Optionnel**';
                            const type = this.getOptionType(option.type);
                            return `**${option.name}** ${required} ${type}\n└ ${option.description}`;
                        }).join('\n\n');

                        detailEmbed.addFields([
                            { name: '⚙️ Paramètres', value: optionsText, inline: false }
                        ]);
                    }

                    const examples = this.getCommandExamples(command.data.name);
                    if (examples.length > 0) {
                        detailEmbed.addFields([
                            { 
                                name: '💡 Exemples d\'utilisation', 
                                value: examples.join('\n'), 
                                inline: false 
                            }
                        ]);
                    }

                    await interaction.reply({ 
                        embeds: [detailEmbed], 
                        flags: MessageFlags.Ephemeral 
                    });

                    console.log(`📚 → ${interaction.user.username} a consulté l'aide pour /${selectedCommand}`);
                }

            } catch (error) {
                console.error('⚠️ → Erreur lors de la gestion du menu de sélection:', error);
                
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: "Une erreur s'est produite lors du traitement de cette sélection.",
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    await interaction.followUp({
                        content: "Une erreur s'est produite lors du traitement de cette sélection.",
                        flags: MessageFlags.Ephemeral
                    });
                }
            }
        }
    },

    getOptionType(type) {
        const types = {
            1: '`[Sous-commande]`',
            2: '`[Groupe]`',
            3: '`[Texte]`',
            4: '`[Nombre]`',
            5: '`[Booléen]`',
            6: '`[Utilisateur]`',
            7: '`[Salon]`',
            8: '`[Rôle]`',
            9: '`[Mentionnable]`',
            10: '`[Décimal]`',
            11: '`[Fichier]`'
        };
        return types[type] || '`[Inconnu]`';
    },

    getCommandExamples(commandName) {
        const examples = {
            'help': [
                '`/help` - Affiche toutes les commandes',
                '`/help commande:ping` - Détails sur la commande ping'
            ],
            'ticket': [
                '`/ticket sujet:question` - Créer un ticket pour une question',
                '`/ticket sujet:bug` - Signaler un bug'
            ],
            'ping': [
                '`/ping` - Vérifier la latence du bot'
            ]
        };
        return examples[commandName] || [];
    }
};