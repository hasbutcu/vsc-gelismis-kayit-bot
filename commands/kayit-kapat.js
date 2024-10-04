const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getConfig, setConfig } = require('../utils/configUtils'); // Bu yardımcı dosya config.json ile etkileşimde bulunmak için kullanılacaktır

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıt-kapat')
        .setDescription('Kayıt sistemini kapatır'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.',
                ephemeral: true
            });
        }

        const confirmationEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('SORU!')
            .setDescription('**Kayıt sistemini kapatmak istediğinize emin misiniz? Ayarlarınız silinecektir.**\n`(Evet ya da Hayır olarak cevaplandırın.)`');

        await interaction.reply({ embeds: [confirmationEmbed] });

        const filter = response => response.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

        collector.on('collect', async response => {
            const answer = response.content.toLowerCase();
            
            if (answer === 'evet') {
                try {
                    // Sunucuya özel JSON dosyasını güncelle
                    const config = await getConfig(interaction.guild.id);
                    if (config) {
                        // Konfigürasyonu sıfırla
                        await setConfig(interaction.guild.id, {});
                        await interaction.followUp({ content: 'Kayıt sistemi başarıyla kapatıldı.', ephemeral: true });
                    } else {
                        await interaction.followUp({ content: 'Kayıt sistemi zaten kapalı veya yapılandırma bulunamadı.', ephemeral: true });
                    }
                } catch (error) {
                    console.error('Kayıt sistemi kapatılırken bir hata oluştu:', error);
                    await interaction.followUp({ content: 'Kayıt sistemi kapatılırken bir hata oluştu.', ephemeral: true });
                }
            } else if (answer === 'hayır') {
                await interaction.followUp({ content: 'Kayıt sistemi kapatma işlemi iptal edildi.', ephemeral: true });
            } else {
                await interaction.followUp({ content: 'Geçersiz yanıt. Lütfen `Evet` ya da `Hayır` olarak cevaplayın.', ephemeral: true });
            }
            collector.stop(); // Toplama işlemini bitir
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp({ content: 'Yanıt süresi doldu. Kayıt sistemi kapatma işlemi iptal edildi.', ephemeral: true });
            }
        });
    },
};
