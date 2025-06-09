const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

const CATEGORIES = {
    'Modération': { emoji: '🛡️', keywords: ['ban', 'kick', 'mute', 'warn', 'clear', 'purge', 'timeout', 'moderation', 'modérat'] },
    'Musique': { emoji: '🎵', keywords: ['play', 'music', 'song', 'skip', 'stop', 'queue', 'volume', 'pause', 'resume', 'musique'] },
    'Support': { emoji: '🎫', keywords: ['ticket', 'support', 'help', 'contact', 'aide'] },
    'Information': { emoji: 'ℹ️', keywords: ['info', 'user', 'server', 'ping', 'stats', 'about', 'profile', 'avatar'] },
    'Divertissement': { emoji: '🎮', keywords: ['fun', 'game', 'joke', 'meme', 'random', 'roll', 'dice', 'jeu'] },
    'Utilitaires': { emoji: '🔧', keywords: ['util', 'tool', 'convert', 'calculate', 'search', 'weather', 'remind'] },
    'Autres': { emoji: '📂', keywords: [] }
};

const COMMAND_EMOJIS = {
    help: '📚', ticket: '🎫', ping: '🏓', ban: '🔨', kick: '👢',
    play: '▶️', stop: '⏹️', info: 'ℹ️'
};

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
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const commands = interaction.client.commands;
        
        const choices = Array.from(commands.values())
            .filter(command => command.data.name.startsWith(focusedValue))
            .slice(0, 25)
            .map(command => ({
                name: `/${command.data.name} - ${this.cleanDescription(command.data.description)}`,
                value: command.data.name
            }));

        await interaction.respond(choices);
    },

    async execute(interaction) {
        const specificCommand = interaction.options.getString('commande');
        const commands = interaction.client.commands;
        
        if (specificCommand) {
            return this.handleSpecificCommand(interaction, commands, specificCommand);
        }

        const commandCategories = this.categorizeCommands(commands);
        const mainEmbed = this.createMainEmbed(commands, commandCategories, interaction);
        const selectMenu = this.createSelectMenu(commands);

        await interaction.reply({ 
            embeds: [mainEmbed], 
            components: [selectMenu], 
            flags: MessageFlags.Ephemeral 
        });
    },

    async handleSpecificCommand(interaction, commands, commandName) {
        const command = commands.get(commandName);
        
        if (!command) {
            const errorEmbed = new EmbedBuilder()
                .setColor(process.env.COLOR_ERROR || '#D12128')
                .setDescription('❌ **Commande introuvable**')
                .setTimestamp();

            return interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
        }

        const detailEmbed = new EmbedBuilder()
            .setColor(process.env.COLOR_INFO || '#5E7381')
            .setTitle('📖 Détails de la commande')
            .addFields([
                { name: '🏷️ Nom', value: `\`/${command.data.name}\``, inline: true },
                { name: '📝 Description', value: command.data.description || 'Aucune description', inline: false }
            ])
            .setTimestamp();

        if (command.data.options?.length > 0) {
            const optionsText = command.data.options.map(option => {
                const required = option.required ? '**`[Requis]`**' : '`[Optionnel]`';
                return `• **${option.name}** ${required}\n  ${option.description}`;
            }).join('\n\n');

            detailEmbed.addFields([{ name: '⚙️ Paramètres', value: optionsText, inline: false }]);
        }

        return interaction.reply({ embeds: [detailEmbed], flags: MessageFlags.Ephemeral });
    },

    createMainEmbed(commands, commandCategories, interaction) {
        const embed = new EmbedBuilder()
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
                const commandsText = commandList.map(cmd => `\`/${cmd.name}\``).join(' • ');
                embed.addFields([{ 
                    name: `${CATEGORIES[category].emoji} ${category}`, 
                    value: commandsText, 
                    inline: false 
                }]);
            }
        });

        return embed;
    },

    createSelectMenu(commands) {
        return new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help_command_select')
                    .setPlaceholder('🔍 Choisir une commande pour plus de détails...')
                    .addOptions(
                        Array.from(commands.values()).map(command => ({
                            label: `/${command.data.name}`,
                            description: this.truncateDescription(command.data.description),
                            value: command.data.name,
                            emoji: COMMAND_EMOJIS[command.data.name] || '⚡'
                        }))
                    )
            );
    },

    categorizeCommands(commands) {
        const categories = Object.keys(CATEGORIES).reduce((acc, key) => {
            acc[key] = [];
            return acc;
        }, {});

        commands.forEach(command => {
            const name = command.data.name.toLowerCase();
            const description = command.data.description.toLowerCase();
            
            const category = Object.entries(CATEGORIES).find(([_, config]) => 
                config.keywords.some(keyword => name.includes(keyword) || description.includes(keyword))
            );

            const categoryName = category ? category[0] : 'Autres';
            categories[categoryName].push(command.data);
        });

        return categories;
    },

    cleanDescription(description) {
        return description?.replace(/[^\w\s-]/g, '').trim() || 'Aucune description';
    },

    truncateDescription(description) {
        const cleaned = this.cleanDescription(description);
        return cleaned.length > 50 ? cleaned.substring(0, 50) + '...' : cleaned;
    }
};