const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { getConfig, setConfig } = require('../utils/configUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sembol-ayarla')
        .setDescription('Kayıt sistemindeki sembolü ayarlar.')
        .addStringOption(option => 
            option.setName('sembol')
                .setDescription('Ayarla istediğiniz sembolü girin')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Kullanıcının yönetici iznine sahip olup olmadığını kontrol et
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply('Bu komutu kullanma yetkiniz yok.');
        }

        // Kullanıcının belirlediği sembolü alın
        const sembol = interaction.options.getString('sembol');

        // Konfigürasyonu alın
        const config = await getConfig(interaction.guild.id);
        if (!config) {
            return interaction.reply('Konfigürasyon alınamadı. Lütfen kayıt sistemi ayarlarını kontrol edin.');
        }

        // Yeni sembolü ayarla
        try {
            // Konfigürasyon objesini güncelle
            const updatedConfig = { ...config, sembol };
            await setConfig(interaction.guild.id, updatedConfig);

            // Başarı mesajını gönder
            await interaction.reply(`Sembol başarıyla "${sembol}" olarak ayarlandı.`);
        } catch (error) {
            console.error('Sembol ayarlarken bir hata oluştu:', error);
            await interaction.reply('Sembol ayarlanırken bir hata oluştu.');
        }
    },
};
