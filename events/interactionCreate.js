const { PermissionsBitField } = require('discord.js');
const { getConfig } = require('../utils/configUtils');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;
        const command = client.commands.get(commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply('Komut işlenirken bir hata oluştu.');
        }
    },
};
