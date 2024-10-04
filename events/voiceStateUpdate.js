const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
const { ChannelType } = require('discord.js');
const config = require('../config.json');
const tip = config.tip; // tip'i config'den al

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        // Eğer tip 'public' ise, işlemleri durdur
        if (tip === "public") {
            console.log('Tip public, voiceStateUpdate işlemleri yapılmadı.');
            return; // Daha fazla işlem yapılmadan fonksiyonu sonlandır
        }
        // Botun ses kanalından ayrıldığını kontrol et
        if (newState.id === oldState.client.user.id) {
            // Bot ses kanalına bağlı mı?
            if (!newState.channelId) {
                // Bot ses kanalından ayrıldı, yeniden bağlanmayı dene
                const channel = newState.guild.channels.cache.get(config.voiceChannelId);
                if (channel && channel.type === ChannelType.GuildVoice) {
                    joinChannel(channel);
                } else {
                    console.error('Ses kanalına erişilemiyor veya kanal bulunamadı.');
                }
            } else if (oldState.channelId && !newState.channelId) {
                // Bot bir ses kanalından ayrıldı
                console.log('Bot ses kanalından ayrıldı, yeniden bağlanmayı deniyor...');
                const channel = newState.guild.channels.cache.get(config.voiceChannelId);
                if (channel && channel.type === ChannelType.GuildVoice) {
                    joinChannel(channel);
                } else {
                    console.error('Ses kanalına erişilemiyor veya kanal bulunamadı.');
                }
            }
        }
    }
};

function joinChannel(channel) {
    try {
        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        console.log(`Bot ${channel.name} kanalına bağlandı.`);
    } catch (error) {
        console.error('Kanal bağlantısında bir hata oluştu:', error);
    }
}
