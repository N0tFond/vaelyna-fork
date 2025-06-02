const Discord = require('discord.js');
const { REST, Routes } = Discord;
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const commandsHandler = async (client) => {
    const commands = [];

    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log("🤖 → Enregisrement des commandes...");

        await rest.put(Routes.applicationCommands(process.env.APP_ID), {
            body: commands
        });

        console.log("🤖 → Commandes enregistrées avec succès !");
    } catch (error) {
        console.error(error);
    }
};

module.exports = commandsHandler;