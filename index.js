const Discord = require('discord.js');
require('dotenv').config();

const client = new Discord.Client({
    intents: [ // Gestion es autorisations du bot au près de l'api Discord
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildPresences,
        Discord.GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Discord.Collection();

const readyHandler = require('./handlers/ready');
readyHandler(client); // Gestion de la mise en ligne du bot

const commandsHandler = require('./handlers/commands');
commandsHandler(client); // Gestion des commandes + envoie à l'api Discord

const interactionHandler = require('./handlers/interaction');
interactionHandler(client); // Gestion des interactions

const guildUserJoin = require('./handlers/guildUserJoin.js');
guildUserJoin(client); // Gestion des nouveaux membres

const createUserVoice = require('./handlers/createUserVoice.js');
createUserVoice(client); // Gestion des salons à la volé

const createThreadPresntation = require('./handlers/createThreadPresntation.js');
createThreadPresntation(client); // Gestion de la création automatique de threads dans le salon présentation


// Connexion à l'api Discord pour lancer le bot.
client.login(process.env.TOKEN);