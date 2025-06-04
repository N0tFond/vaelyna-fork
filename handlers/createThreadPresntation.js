const Discord = require('discord.js');
const { ThreadAutoArchiveDuration } = require('discord.js');
require('dotenv').config();

const createThreadPresntation = (client) => {

    client.on('messageCreate', async (message) => {

        if(message.author.bot) return;

        if(message.channel.id !== "1378583912606863370") return;

        const emotesList = [
            "😊",
            "🌟",
            "👋",
            "🎉",
            "💫",
            "🌈",
            "✨",
            "🎊",
            "🙋‍♂️"
        ];
        
        const emote = emotesList[Math.floor(Math.random() * emotesList.length)];

        try {
            
            await message.channel.threads.create({
                name: `${emote} - Présentation de ${message.author.username}`,
                autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
                reason: 'Salon de réponses à la présentation de ' + message.author.username,
            });

        } catch (error) {
            console.error("⚠️ → Une erreur est survenue lors de la création du thread : ", error);
        }
    });
}

module.exports = createThreadPresntation;