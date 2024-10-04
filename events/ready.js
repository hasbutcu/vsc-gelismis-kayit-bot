const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const { ActivityType } = require('discord.js');
const config = require('../config.json');
const allowedGuildIds = config.sunucular
const tip = config.tip
module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.clear(); // Terminal ekranını temizler

        // Komutları saklamak için bir Map koleksiyonu oluşturun
        client.commands = new Map();

        // Komutları yükleme
        const commandsPath = path.join(__dirname, '../commands'); // Komut dosyalarının yolu
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        // Komutları sırayla yükleyin
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            // Komutları Map koleksiyonuna ekle
            client.commands.set(command.data.name.toLowerCase(), command);

            console.log(`[+] ${command.data.name} komutu yüklendi`);
        }

        // Son komut yüklendiğinde, botun hazır olduğunu bildirir
        console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
		
          client.guilds.cache.forEach(guild => {
            // Eğer sunucu ID'si listede yoksa, bot sunucudan çıkış yapsın
            if (tip === "public") {
                console.log('Tip public, sunucu ID kontrolü yapılmadı.');
                return;
            }
            else{
                console.log(`Bot Tipi ${tip} = public olmadığı için id'si belirtilmemiş sunuculardan çıkılıcak`)
            }
            
            if (!allowedGuildIds.includes(guild.id)) {
                console.log(`Bot bu sunucuda olmamalı. Sunucudan çıkılıyor: ${guild.name}`);
                guild.leave()
                    .then(g => console.log(`Bot şu sunucudan ayrıldı: ${g.name}`))
                    .catch(err => console.error(`Sunucudan çıkarken hata oluştu: ${err}`));
            }
            
        });
        // Config dosyasını oku
        const configPath = path.join(__dirname, '../config.json');
        let config;

        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (error) {
            console.error('Config dosyası okunurken bir hata oluştu:', error);
            return;
        }

        // ActivityType enum'ında mevcut türleri küçük harfli olarak saklayarak normalize et
        const activityTypes = {
            'playing': ActivityType.Playing,
            'streaming': ActivityType.Streaming,
            'listening': ActivityType.Listening,
            'watching': ActivityType.Watching,
            'competing': ActivityType.Competing,
            'custom': ActivityType.Custom,
        };

        // Config türünü normalize et
        const configType = (config.type || '').toLowerCase(); // Küçük harfe çevir
        const activityType = activityTypes[configType];

        if (!activityType) {
            console.error('config.json ==> yanlış tip');
            return;
        }

        try {
            await client.user.setPresence({
                activities: [{ name: config.activity, type: activityType }],
                status: config.status, 
            });
            console.log('Durum Başarıyla Ayarlandı.');
        } catch (error) {
            console.error('Durum Ayarlanırken Hata Oluştu:', error);
        }
    },
};
