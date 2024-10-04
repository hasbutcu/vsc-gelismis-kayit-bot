const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getConfig } = require('../utils/configUtils'); // İlgili dosyadan getConfig fonksiyonunu import et

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıt-ayarlar')
        .setDescription('Kayıt sisteminin ayarlarını gösterir'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.',
                ephemeral: true
            });
        }

        // Sunucuya özgü ayarları al
        const config = await getConfig(interaction.guild.id);

        // Eğer ayarlar mevcut değilse, hata mesajı gönder
        if (!config) {
            return interaction.reply('Kayıt sisteminin ayarları bulunamadı. Lütfen /kayit-kur komutunu kullanarak sistemi kurun.');
        }

        // Embed oluştur
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Kayıt Ayarlarınız!')
            .setDescription('Kayıt sistemi ayarlarınız aşağıda yer almaktadır.')
            .addFields(
                { name: 'Kayıt Kanalı', value: `<#${config.kayitKanal}>`, inline: true },
                { name: 'Kayıt Türü', value: config.kayitTuru === 'normal' ? 'Normal Kayıt' : 'Cinsiyet Kayıt', inline: true },
                { name: 'Kayıt Rol/Rolleri', value: config.kayitTuru === 'normal' ? `<@&${config.kayitRol}>` : `Kız: <@&${config.kayitRol.kiz}>\nErkek: <@&${config.kayitRol.erkek}>`, inline: true },
                { name: 'Kayıtsız Üye', value: `<@&${config.kayitsizRol}>`, inline: true },
                { name: 'Kayıtçı Rolü', value: config.kayitciRol === 'geç' ? 'Geçildi' : `<@&${config.kayitciRol}>`, inline: true },
                { name: 'Kayıt Mesajları Kanalı', value: `<#${config.mesajKanal}>`, inline: true },
                { name: 'Sembol', value: config.sembol || 'Sembol yok', inline: true },
                { name: 'Tag', value: config.tag || 'Tag yok', inline: true },
                { name: 'Otomatik İsim', value: config.otoIsim ? 'Açık' : 'Kapalı', inline: true },
                { name: 'Otomatik Rol', value: config.otoRol === 'Kapalı' ? 'Kapalı' : `<@&${config.otoRol}>`, inline: true },
                { name: 'Hoş Geldin Etiketi', value: config.hosGeldinEtiketi || 'Hoş Geldin Etiketi Açık', inline: true },
                { name: 'İsim Yaş Gereksinim', value: `İsim: ${config.isimGerekli || 'Gerekli'}\nYaş: ${config.yasGerekli || 'Gerekli'}`, inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    },
};
