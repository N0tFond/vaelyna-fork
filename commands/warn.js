const { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

// Constants
const MAX_REASON_LENGTH = 1024;
const WARN_EMOJI = '⚠️';
const ANNOUNCEMENT_EMOJI = '📢';

// Messages
const MESSAGES = {
    NO_PERMISSION: "🙎 → Vous n'avez pas la permission d'utiliser cette commande.",
    ERROR_OCCURRED: "❌ → Une erreur est survenue lors de l'envoi de l'avertissement.",
    SELF_WARN: "❌ → Vous ne pouvez pas vous avertir vous-même.",
    BOT_WARN: "❌ → Vous ne pouvez pas avertir un bot.",
    STAFF_WARN: "❌ → Vous ne pouvez pas avertir un autre membre du staff."
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('🔎 → Permet aux membres du staff de donner un avertissement écrit.')
        .addUserOption(option =>
            option
                .setName("utilisateur")
                .setDescription("Utilisateur à avertir")
                .setRequired(true)
        )
        .addStringOption(option => 
            option
                .setName("raison")
                .setDescription("Raison de l'avertissement")
                .setRequired(true)
                .setMaxLength(MAX_REASON_LENGTH)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser("utilisateur");
            const reason = interaction.options.getString("raison");
            const executor = interaction.user;

            // Permission check
            if (!hasStaffPermission(interaction)) {
                return await sendErrorReply(interaction, MESSAGES.NO_PERMISSION);
            }

            // Validation checks
            const validationError = validateWarnTarget(interaction, targetUser);
            if (validationError) {
                return await sendErrorReply(interaction, validationError);
            }

            // Create and send warning
            await sendWarning(interaction, targetUser, executor, reason);

            // Optional: Send DM to warned user
            await sendWarningDM(targetUser, executor, reason, interaction.guild);

        } catch (error) {
            console.error(`${WARN_EMOJI} → Erreur lors de l'avertissement:`, {
                executor: interaction.user.tag,
                target: interaction.options.getUser("utilisateur")?.tag,
                guild: interaction.guild?.name,
                error: error.message
            });
            
            await handleError(interaction);
        }
    }
};

/**
 * Check if user has staff permissions
 */
function hasStaffPermission(interaction) {
    const staffRoleId = process.env.STAFF_ROLE;
    return staffRoleId && interaction.member.roles.cache.has(staffRoleId);
}

/**
 * Validate the warning target
 */
function validateWarnTarget(interaction, targetUser) {
    const executor = interaction.user;
    const staffRoleId = process.env.STAFF_ROLE;

    // Can't warn yourself
    if (targetUser.id === executor.id) {
        return MESSAGES.SELF_WARN;
    }

    // Can't warn bots
    if (targetUser.bot) {
        return MESSAGES.BOT_WARN;
    }

    // Can't warn other staff members (if they're in the guild)
    const targetMember = interaction.guild.members.cache.get(targetUser.id);
    if (targetMember && staffRoleId && targetMember.roles.cache.has(staffRoleId)) {
        return MESSAGES.STAFF_WARN;
    }

    return null;
}

/**
 * Send error reply
 */
async function sendErrorReply(interaction, message) {
    return await interaction.reply({ 
        content: message, 
        flags: MessageFlags.Ephemeral 
    });
}

/**
 * Create and send the warning embed
 */
async function sendWarning(interaction, targetUser, executor, reason) {
    const embed = new EmbedBuilder()
        .setTitle(`${WARN_EMOJI} Avertissement`)
        .setDescription(`> ${ANNOUNCEMENT_EMOJI} → ${targetUser} a été averti par ${executor}`)
        .addFields(
            { 
                name: "Raison", 
                value: `\`\`\`${reason}\`\`\``, 
                inline: false 
            },
            { 
                name: "Modérateur", 
                value: `${executor.tag}`, 
                inline: true 
            },
            { 
                name: "Date", 
                value: `<t:${Math.floor(Date.now() / 1000)}:F>`, 
                inline: true 
            }
        )
        .setColor(process.env.COLOR_ERROR || '#ff0000')
        .setThumbnail(targetUser.displayAvatarURL())
        .setTimestamp()
        .setFooter({ 
            text: `ID: ${targetUser.id}`,
            iconURL: interaction.guild.iconURL() 
        });

    await interaction.reply({ embeds: [embed] });
}

/**
 * Send warning DM to the user (optional)
 */
async function sendWarningDM(targetUser, executor, reason, guild) {
    try {
        const dmEmbed = new EmbedBuilder()
            .setTitle(`${WARN_EMOJI} Vous avez reçu un avertissement`)
            .setDescription(`Vous avez été averti sur le serveur **${guild.name}**`)
            .addFields(
                { 
                    name: "Raison", 
                    value: `\`\`\`${reason}\`\`\``, 
                    inline: false 
                },
                { 
                    name: "Modérateur", 
                    value: `${executor.tag}`, 
                    inline: true 
                }
            )
            .setColor(process.env.COLOR_ERROR || '#ff0000')
            .setThumbnail(guild.iconURL())
            .setTimestamp();

        await targetUser.send({ embeds: [dmEmbed] });
    } catch (error) {
        // Silently fail if DM can't be sent (user has DMs disabled)
        console.log(`Impossible d'envoyer un DM à ${targetUser.tag}: ${error.message}`);
    }
}

/**
 * Handle errors appropriately
 */
async function handleError(interaction) {
    const errorMessage = MESSAGES.ERROR_OCCURRED;
    
    try {
        if (interaction.deferred) {
            await interaction.editReply({ content: errorMessage });
        } else if (!interaction.replied) {
            await interaction.reply({ 
                content: errorMessage, 
                flags: MessageFlags.Ephemeral 
            });
        }
    } catch (replyError) {
        console.error("Erreur lors de l'envoi de la réponse d'erreur:", replyError);
    }
}