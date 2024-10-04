const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json')
const token = config.token
const clientId = config.clientId
const guildId = config.guildId

// Komutları yükle
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

// REST API aracılığıyla komutları kaydet
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Başlıyor: Komutlar güncelleniyor...');

        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commands,
        });

        console.log('Komutlar başarıyla güncellendi!');
    } catch (error) {
        console.error(error);
    }
})();