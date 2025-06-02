const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('📚 → Affiche la liste des commandes disponibles.')
        .addStringOption(option =>
            option.setName('commande')
                .setDescription('Nom de la commande pour obtenir des détails')
                .setRequired(false)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const commands = interaction.client.commands;
        
        const choices = Array.from(commands.values())
            .filter(command => command.data.name.startsWith(focusedValue.toLowerCase()))
            .slice(0, 25) // Discord limite à 25 choix
            .map(command => ({
                name: `/${command.data.name} - ${command.data.description.replace(/[^\w\s-]/g, '').trim()}`,
                value: command.data.name
            }));

        await interaction.respond(choices);
    },

    async execute(interaction) {
        const specificCommand = interaction.options.getString('commande');
        const commands = interaction.client.commands;
        
        if (specificCommand) {
            const command = commands.get(specificCommand);
            
            if (!command) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(process.env.COLOR_ERROR || '#D12128')
                    .setDescription('❌ **Commande introuvable**')
                    .setTimestamp();

                return interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            const detailEmbed = new EmbedBuilder()
                .setColor(process.env.COLOR_INFO || '#5E7381')
                .setTitle(`📖 Détails de la commande`)
                .addFields([
                    { 
                        name: '🏷️ Nom', 
                        value: `\`/${command.data.name}\``, 
                        inline: true 
                    },
                    { 
                        name: '📝 Description', 
                        value: command.data.description || 'Aucune description', 
                        inline: false 
                    }
                ])
                .setTimestamp();

            if (command.data.options && command.data.options.length > 0) {
                const optionsText = command.data.options.map(option => {
                    const required = option.required ? '**`[Requis]`**' : '`[Optionnel]`';
                    return `• **${option.name}** ${required}\n  ${option.description}`;
                }).join('\n\n');

                detailEmbed.addFields([
                    { name: '⚙️ Paramètres', value: optionsText, inline: false }
                ]);
            }

            return interaction.reply({ embeds: [detailEmbed], flags: MessageFlags.Ephemeral });
        }

        const commandCategories = this.categorizeCommands(commands);
        
        const mainEmbed = new EmbedBuilder()
            .setColor(process.env.COLOR_INFO || '#5E7381')
            .setTitle('📚 Centre d\'aide')
            .setDescription('Voici toutes les commandes disponibles sur le serveur.')
            .setFooter({ 
                text: `${commands.size} commande${commands.size > 1 ? 's' : ''} disponible${commands.size > 1 ? 's' : ''}`,
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        Object.entries(commandCategories).forEach(([category, commandList]) => {
            if (commandList.length > 0) {
                const commandsText = commandList
                    .map(cmd => `\`/${cmd.name}\``)
                    .join(' • ');
                
                mainEmbed.addFields([
                    { 
                        name: `${this.getCategoryEmoji(category)} ${category}`, 
                        value: commandsText, 
                        inline: false 
                    }
                ]);
            }
        });

        const selectMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help_command_select')
                    .setPlaceholder('🔍 Choisir une commande pour plus de détails...')
                    .addOptions(
                        Array.from(commands.values()).map(command => ({
                            label: `/${command.data.name}`,
                            description: this.truncateDescription(command.data.description),
                            value: command.data.name,
                            emoji: this.getCommandEmoji(command.data.name)
                        }))
                    )
            );

        await interaction.reply({ 
            embeds: [mainEmbed], 
            components: [selectMenu], 
            flags: MessageFlags.Ephemeral 
        });
    },

    categorizeCommands(commands) {
        const categories = {
            'Modération': [],
            'Musique': [],
            'Utilitaires': [],
            'Support': [],
            'Divertissement': [],
            'Information': [],
            'Autres': []
        };

        commands.forEach(command => {
            const name = command.data.name.toLowerCase();
            const description = command.data.description.toLowerCase();
            
            if (this.isModerationCommand(name, description)) {
                categories['Modération'].push(command.data);
            } else if (this.isMusicCommand(name, description)) {
                categories['Musique'].push(command.data);
            } else if (this.isSupportCommand(name, description)) {
                categories['Support'].push(command.data);
            } else if (this.isInfoCommand(name, description)) {
                categories['Information'].push(command.data);
            } else if (this.isFunCommand(name, description)) {
                categories['Divertissement'].push(command.data);
            } else if (this.isUtilityCommand(name, description)) {
                categories['Utilitaires'].push(command.data);
            } else {
                categories['Autres'].push(command.data);
            }
        });

        return categories;
    },

    isModerationCommand(name, description) {
        const keywords = ['ban', 'kick', 'mute', 'warn', 'clear', 'purge', 'timeout', 'moderation', 'modérat'];
        return keywords.some(keyword => name.includes(keyword) || description.includes(keyword));
    },

    isMusicCommand(name, description) {
        const keywords = ['play', 'music', 'song', 'skip', 'stop', 'queue', 'volume', 'pause', 'resume', 'musique'];
        return keywords.some(keyword => name.includes(keyword) || description.includes(keyword));
    },

    isSupportCommand(name, description) {
        const keywords = ['ticket', 'support', 'help', 'contact', 'aide'];
        return keywords.some(keyword => name.includes(keyword) || description.includes(keyword));
    },

    isInfoCommand(name, description) {
        const keywords = ['info', 'user', 'server', 'ping', 'stats', 'about', 'profile', 'avatar'];
        return keywords.some(keyword => name.includes(keyword) || description.includes(keyword));
    },

    isFunCommand(name, description) {
        const keywords = ['fun', 'game', 'joke', 'meme', 'random', 'roll', 'dice', 'joke', 'jeu'];
        return keywords.some(keyword => name.includes(keyword) || description.includes(keyword));
    },

    isUtilityCommand(name, description) {
        const keywords = ['util', 'tool', 'convert', 'calculate', 'search', 'weather', 'remind'];
        return keywords.some(keyword => name.includes(keyword) || description.includes(keyword));
    },

    getCategoryEmoji(category) {
        const emojis = {
            'Modération': '🛡️',
            'Musique': '🎵',
            'Utilitaires': '🔧',
            'Support': '🎫',
            'Divertissement': '🎮',
            'Information': 'ℹ️',
            'Autres': '📂'
        };
        return emojis[category] || '📁';
    },

    getCommandEmoji(commandName) {
        const emojis = {
            'help': '📚',
            'ticket': '🎫',
            'ping': '🏓',
            'ban': '🔨',
            'kick': '👢',
            'play': '▶️',
            'stop': '⏹️',
            'info': 'ℹ️'
        };
        return emojis[commandName] || '⚡';
    },

    truncateDescription(description) {
        if (!description) return 'Aucune description';
        const cleaned = description.replace(/[^\w\s-]/g, '').trim();
        return cleaned.length > 50 ? cleaned.substring(0, 50) + '...' : cleaned;
    }
};