const { SlashCommandBuilder } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('cafe')
        .setDescription('☕ → Permet de te faire un café.'),

    async execute(interaction) {
        await interaction.reply({ content: "Je ne suis pas là pour te faire le café, tu peut te levé te faire un café ou demander à quelqu'un d'autre de te le faire mon chou." });
    }
}