const { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();
const db = require('../db');

const MAX_REASON_LENGTH = 1024;
const WARN_EMOJI = '⚠️';
const ANNOUNCEMENT_EMOJI = '📢';

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

            if (!hasStaffPermission(interaction)) {
                return await sendErrorReply(interaction, MESSAGES.NO_PERMISSION);
            }

            const validationError = validateWarnTarget(interaction, targetUser);
            if (validationError) {
                return await sendErrorReply(interaction, validationError);
            }

            await sendWarning(interaction, targetUser, executor, reason);
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

function hasStaffPermission(interaction) {
    const staffRoleId = process.env.STAFF_ROLE;
    return staffRoleId && interaction.member.roles.cache.has(staffRoleId);
}

function validateWarnTarget(interaction, targetUser) {
    const executor = interaction.user;
    const staffRoleId = process.env.STAFF_ROLE;

    if (targetUser.id === executor.id) {
        return MESSAGES.SELF_WARN;
    }

    if (targetUser.bot) {
        return MESSAGES.BOT_WARN;
    }

    const targetMember = interaction.guild.members.cache.get(targetUser.id);
    if (targetMember && staffRoleId && targetMember.roles.cache.has(staffRoleId)) {
        return MESSAGES.STAFF_WARN;
    }

    return null;
}

async function sendErrorReply(interaction, message) {
    return await interaction.reply({ 
        content: message, 
        flags: MessageFlags.Ephemeral 
    });
}

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

    try {
        await db.query(
            'INSERT INTO warns (author, user, reason, date) VALUES (?, ?, ?, ?)',
            [executor.tag, targetUser.tag, reason, new Date().toISOString()]
        );
    } catch (err) {
        console.error('⚠️ → Erreur lors de l\'insertion du warn en base de données :', err);
    }
}

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
        console.log(`Impossible d'envoyer un DM à ${targetUser.tag}: ${error.message}`);
    }
}

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
