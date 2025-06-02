const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('🔎 → Permet de contacter les membres de l\'équipe.')
        .addStringOption(option =>
            option.setName('sujet')
                .setDescription('Le sujet de votre ticket')
                .setRequired(true)
                .addChoices(
                    { name: '❓ Question générale', value: 'question' },
                    { name: '🐛 Signaler un bug', value: 'bug' },
                    { name: '💡 Suggestion', value: 'suggestion' },
                    { name: '⚠️ Signalement', value: 'report' },
                    { name: '🔧 Support technique', value: 'support' },
                    { name: '📝 Autre', value: 'autre' }
                )
        ),

    async execute(interaction) {
        const sujet = interaction.options.getString('sujet');
        const user = interaction.user;
        const guild = interaction.guild;

        // Vérifier si l'utilisateur a déjà un ticket ouvert
        const existingTicket = guild.channels.cache.find(
            channel => channel.name === `ticket-${user.username.toLowerCase()}` && 
            channel.type === ChannelType.GuildText
        );

        if (existingTicket) {
            const errorEmbed = new EmbedBuilder()
                .setColor(process.env.COLOR_ERROR || '#D12128')
                .setDescription(`❌ → **Vous avez déjà un ticket ouvert** <#${existingTicket.id}>`);

            return interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
        }

        try {
            // Créer le salon de ticket
            const ticketChannel = await guild.channels.create({
                name: `ticket-${user.username.toLowerCase()}`,
                type: ChannelType.GuildText,
                parent: process.env.SUPPORT_CATEGORY || null,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AttachFiles
                        ],
                    },
                    {
                        id: process.env.STAFF_ROLE,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.ManageMessages
                        ],
                    },
                ],
            });

            // Embed de confirmation pour l'utilisateur
            const confirmEmbed = new EmbedBuilder()
                .setColor(process.env.COLOR_SUCCESS || '#90955C')
                .setDescription(`✅ → **Votre ticket a été créé** <#${ticketChannel.id}>\n📋 **Sujet :** ${getSujetName(sujet)}`);

            await interaction.reply({ embeds: [confirmEmbed], flags: MessageFlags.Ephemeral });

            // Embed de bienvenue dans le ticket
            const welcomeEmbed = new EmbedBuilder()
                .setColor(process.env.COLOR_INFO || '#5E7381')
                .setDescription(`👋 Salut ${user} ! Bienvenue dans votre **ticket de support**\n\n📋 **Sujet :** ${getSujetName(sujet)}\n⏰ **Créé :** <t:${Math.floor(Date.now() / 1000)}:R>\n\n💬 *Décrivez votre problème en détail, un membre de l'équipe vous répondra rapidement !*`)
                .setFooter({ 
                    text: '🔒 → Cliquez sur le bouton ci-dessous pour fermer ce ticket',
                    iconURL: guild.iconURL()
                });

            // Bouton pour fermer le ticket
            const closeButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('🔒 Fermer le ticket')
                        .setStyle(ButtonStyle.Danger)
                );

            // Message de bienvenue avec mention du staff
            const staffRole = guild.roles.cache.get(process.env.STAFF_ROLE);
            const mentionText = staffRole ? `${staffRole}` : '@Staff';

            await ticketChannel.send({
                content: `${user} ${mentionText}`,
                embeds: [welcomeEmbed],
                components: [closeButton]
            });

            // Log du ticket (optionnel)
            console.log(`🎫 → Nouveau ticket créé par ${user.tag} (${user.id}) - Sujet: ${sujet}`);

        } catch (error) {
            console.error('⚠️ → Erreur lors de la création du ticket:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(process.env.COLOR_ERROR || '#D12128')
                .setDescription('❌ → **Une erreur est survenue** lors de la création du ticket\n*Veuillez réessayer dans quelques instants*');

            if (interaction.replied) {
                return interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                return interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    }
};

// Fonction helper pour obtenir le nom du sujet
function getSujetName(sujet) {
    const sujets = {
        'question': '❓ Question générale',
        'bug': '🐛 Signaler un bug',
        'suggestion': '💡 Suggestion',
        'report': '⚠️ Signalement',
        'support': '🔧 Support technique',
        'autre': '📝 Autre'
    };
    return sujets[sujet] || '📝 Non spécifié';
}