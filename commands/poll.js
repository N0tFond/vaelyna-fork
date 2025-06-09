const { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

// Constants
const NUMBER_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
const MAX_CHOICES = 10;
const MIN_CHOICES = 2;

// Error messages
const ERRORS = {
    NO_PERMISSION: "🙎 → Eh, tu n'as pas la permission de faire cela !",
    TOO_MANY_CHOICES: `⚠️ → Je n'ai pas la possibilité de gérer plus de ${MAX_CHOICES} choix dans un sondage.`,
    TOO_FEW_CHOICES: "⚠️ → Il me faut au moins deux choix pour créer un sondage.",
    EMPTY_CHOICES: "⚠️ → Certains choix sont vides. Vérifiez votre saisie."
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sondage')
        .setDescription('🔎 → Permet aux membres du staff de créer des sondages.')
        .addStringOption(option => 
            option
                .setName("titre")
                .setDescription("Donnez un titre à votre sondage")
                .setRequired(true)
                .setMaxLength(256)
        )
        .addStringOption(option => 
            option
                .setName("choix")
                .setDescription("Entrez les choix possibles séparés par des virgules")
                .setRequired(true)
                .setMaxLength(1024)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        try {
            // Check permissions
            if (!hasStaffPermission(interaction)) {
                return await sendErrorReply(interaction, ERRORS.NO_PERMISSION);
            }

            // Get and validate input
            const title = interaction.options.getString('titre');
            const choicesRaw = interaction.options.getString('choix');
            const choices = parseChoices(choicesRaw);

            // Validate choices
            const validationError = validateChoices(choices);
            if (validationError) {
                return await sendErrorReply(interaction, validationError);
            }

            // Create and send poll
            await createPoll(interaction, title, choices);

        } catch (error) {
            console.error('Error in sondage command:', error);
            const errorMessage = "❌ → Une erreur est survenue lors de la création du sondage.";
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: errorMessage });
            } else {
                await interaction.reply({ 
                    content: errorMessage, 
                    flags: MessageFlags.Ephemeral 
                });
            }
        }
    }
};

/**
 * Check if user has staff permissions
 */
function hasStaffPermission(interaction) {
    const staffRole = process.env.STAFF_ROLE;
    return staffRole && interaction.member.roles.cache.has(staffRole);
}

/**
 * Parse and clean choices from input string
 */
function parseChoices(choicesRaw) {
    return choicesRaw
        .split(',')
        .map(choice => choice.trim())
        .filter(choice => choice.length > 0);
}

/**
 * Validate choices array
 */
function validateChoices(choices) {
    if (choices.length > MAX_CHOICES) {
        return ERRORS.TOO_MANY_CHOICES;
    }
    
    if (choices.length < MIN_CHOICES) {
        return ERRORS.TOO_FEW_CHOICES;
    }
    
    // Check for empty choices after trimming
    if (choices.some(choice => !choice || choice.length === 0)) {
        return ERRORS.EMPTY_CHOICES;
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
 * Create and send poll embed with reactions
 */
async function createPoll(interaction, title, choices) {
    await interaction.deferReply();
    
    // Build description with choices
    const description = choices
        .map((choice, index) => `> ${NUMBER_EMOJIS[index]} **→** ${choice}`)
        .join('\n');

    // Create embed
    const pollEmbed = new EmbedBuilder()
        .setTitle('📊 Nouveau sondage !')
        .setAuthor({ 
            name: interaction.user.username, 
            iconURL: interaction.user.displayAvatarURL() 
        })
        .setDescription(`# ${title}\n${description}`)
        .setColor(process.env.COLOR_INFO || '#0099ff')
        .setFooter({ text: "Réagissez avec les émojis pour voter !" })
        .setTimestamp();
    
    // Send poll
    const message = await interaction.editReply({ 
        content: null,
        embeds: [pollEmbed] 
    });

    // Add reactions concurrently for better performance
    await addReactions(message, choices.length);
}

/**
 * Add reactions to the poll message
 */
async function addReactions(message, choiceCount) {
    const reactionPromises = [];
    
    for (let i = 0; i < choiceCount; i++) {
        reactionPromises.push(message.react(NUMBER_EMOJIS[i]));
    }
    
    // Wait for all reactions to be added
    await Promise.all(reactionPromises);
}