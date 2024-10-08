const { Client, GatewayIntentBits, Collection, ChannelType, REST, Routes } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const tip = config.tip; // Tip değerini config'den al

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.commands = new Collection();

// Komutları yükleme
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Event'leri yükleme
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Bot hazır olduğunda yapılacaklar
client.once('ready', async () => {
    console.log(`${client.user.tag} giriş yaptı.`);

    // Global komutları yükle
    const rest = new REST({ version: '10' }).setToken(config.token);
    const commands = [];
    
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }

    try {
        console.log('Global komutlar yükleniyor...');

        await rest.put(
            Routes.applicationCommands(config.clientId), // Global komutlar için kullanılır
            { body: commands },
        );

        console.log('Global komutlar başarıyla yüklendi.');
    } catch (error) {
        console.error('Komutları yüklerken bir hata oluştu:', error);
    }

    // Eğer tip 'public' ise, sesli kanala bağlanma işlemi yapılmasın
    if (tip === "public") {
        console.log('Tip public, sesli kanala bağlanma işlemi yapılmadı.');
        return;
    }

    const guild = client.guilds.cache.get(config.guildId); // Sunucu ID'si ile guild nesnesini al
    if (!guild) {
        console.error('Sunucu bulunamadı.');
        return;
    }

    const channel = guild.channels.cache.get(config.voiceChannelId); // Sesli kanal ID'si ile kanalı al
    if (channel && channel.type === ChannelType.GuildVoice) {
        try {
            joinVoiceChannel({
                channelId: channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });
            console.log(`Bot ${channel.name} kanalına bağlandı.`);
        } catch (error) {
            console.error('Kanal bağlantısında bir hata oluştu:', error);
        }
    } else {
        console.error('Ses kanalına erişilemiyor veya kanal bulunamadı.');
    }
});

client.login(config.token);
