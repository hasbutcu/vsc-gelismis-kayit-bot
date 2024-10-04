const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun pingini gösterir.'),
    async execute(interaction) {
        await interaction.reply(`Pong! Gecikme: ${Date.now() - interaction.createdTimestamp}ms.`);
    },
};
