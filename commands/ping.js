const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🔎 → Permet de tester le bot et obtenir sa latence.'),

    async execute(interaction) {
        const start = Date.now();

        await interaction.reply({ 
            content: "📡 → Pong ! Je vérifie la latence...", 
            flags: MessageFlags.Ephemeral 
        });

        const botLatency = Date.now() - start;
        const apiLatency = Math.round(interaction.client.ws.ping);

        await interaction.editReply(
            `🔥 → Latences :\n> **Bot** → \`${botLatency}\`ms\n> **API Discord** → \`${apiLatency}\`ms`
        );
    }
};