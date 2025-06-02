module.exports = {

    name: 'interactionCreate',
    async execute(interaction) {

        if(!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if(!command) {
            console.error(`⚠️ → Aucune commande correspondant à ${interaction.commandName} n'a été trouvée.`);
            return;
        }

        try {
            await command.execute(interaction);
            console.log(`💬 → L'utilisateur ${interaction.user.username} à utilisé la commande /${interaction.commandName}.`);
        } catch (error) {
            console.error('⚠️ → Erreur lors de l\'exécution de la commande : ', error);

            if(!interaction.replied && !interaction.deferred) {

                await interaction.reply({
                    content: "Une erreur s'est produite lors de l'exécution de cette commande.",
                    ephemeral: true
                });
            } else {
                
                await interaction.followUp({
                    content: "Une erreur s'est produite lors de l'exécution de cette commande.",
                    ephemeral: true
                });
            }
        }
    },
};