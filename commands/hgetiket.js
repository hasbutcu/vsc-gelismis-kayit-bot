const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { getConfig, setConfig } = require('../utils/configUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hgetiket')
        .setDescription('Hoş geldin mesajının gönderimini açar veya kapatır.')
        .addStringOption(option =>
            option.setName('durum')
                .setDescription('Mesajı açmak için "aç", kapatmak için "kapa" yazın')
                .setRequired(true)),
    async execute(interaction) {
        // Yönetici yetkilerini kontrol et
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.',
                ephemeral: true
            });
        }

        // Konfigürasyonu al
        const config = await getConfig(interaction.guild.id);

        if (!config) {
            return interaction.reply('Kayıt sistemi ayarları bulunamadı. Lütfen /kayit-kur komutunu kullanarak sistemi kurun.');
        }

        // Durumu al
        const durum = interaction.options.getString('durum');

        if (durum !== 'aç' && durum !== 'kapa') {
            return interaction.reply('Geçersiz durum belirtildi. Lütfen "aç" veya "kapa" yazın.');
        }

        // Mesaj gönderimini aç veya kapat
        const updatedConfig = { ...config, hosgeldinMesajiAktif: durum === 'aç' };

        // Güncellenmiş ayarları kaydet
        try {
            await setConfig(interaction.guild.id, updatedConfig);
            return interaction.reply(`Hoş geldin mesajı ${durum === 'aç' ? 'açıldı' : 'kapatıldı'}.`);
        } catch (error) {
            console.error('Konfigürasyon güncellenirken bir hata oluştu:', error);
            return interaction.reply('Hoş geldin mesajı ayarlarını güncellerken bir hata oluştu.');
        }
    },
};
