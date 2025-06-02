const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {

    data: new SlashCommandBuilder()
        .setName('sondage')
        .setDescription('🔎 → Permet aux membres du staff de créer des sondages.')
        .addStringOption(option => 
            option
                .setName("titre")
                .setDescription("Donnez un titre à votre sondage")
                .setRequired(true)
        )
        .addStringOption(option => 
            option
                .setName("choix")
                .setDescription("Entrez les choix possibles séparés par des virgules")
                .setRequired(true)
        ),

    async execute(interaction) {

        const staffRole = process.env.STAFF_ROLE;
        const title = interaction.options.getString('titre');
        const choicesRaw = interaction.options.getString('choix');

        if (!interaction.member.roles.cache.has(staffRole)) {
            await interaction.reply({ 
                content: "🙎 → Eh, tu n'as pas la permission de faire cela !", 
                flags: MessageFlags.Ephemeral 
            });
            return;
        }

        let choices = choicesRaw.split(',').map(choice => choice.trim()).filter(choice => choice !== '');

        if(choices.length > 10) {
            await interaction.reply({ 
                content: "⚠️ → Je n'ai pas la possibilité de gérer plus de dix choix dans un sondage.", 
                flags: MessageFlags.Ephemeral 
            });
            return;
        }

        if(choices.length < 2) {
            await interaction.reply({ 
                content: "⚠️ → Il me semble que lors d'un sondage, on propose plusieurs choix...", 
                flags: MessageFlags.Ephemeral 
            });
            return;
        }

        await interaction.deferReply();
        
        await interaction.editReply({ 
            content: '📢 → Préparation de votre sondage en cours...'
        });

        const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

        let description = '';
        choices.forEach((choice, index) => {
            description += `> ${numberEmojis[index]} **→** ${choice}\n`;
        });

        const pollEmbed = new EmbedBuilder()
            .setTitle(`📊 Nouveau sondage !`)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`# ${title} \n` + description)
            .setColor(process.env.COLOR_INFO)
            .setFooter({ text: "Réagissez avec les émojis pour voter !" })
            .setTimestamp();
        
        const message = await interaction.editReply({ 
            content: null,
            embeds: [pollEmbed] 
        });

        for (let i = 0; i < choices.length; i++) {
            await message.react(numberEmojis[i]);
        }
    }
}