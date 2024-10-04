const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Tüm mevcut komutları listeler.'),

    async execute(interaction) {
        // Kullanıcının profil fotoğrafını al
        const user = interaction.user;
        const userAvatarUrl = user.displayAvatarURL({ size: 128, dynamic: true });

        // Embed oluşturma
        const embed = new EmbedBuilder()
            .setColor(0x00FF00) // Embed rengi
            .setTitle('Komutlar')
            .setDescription('**VSC Kayıt Yardım Menüsüne Hoşgeldin! `Botu kullanmadan önce rolünü en üste alınız.`**')
            .addFields(
                { name: '`/help`', value: '**Tüm mevcut komutları listeler.**', inline: false },
                { name: '`/kayıt-kur`', value: '**Kayıt sistemini aktif edersiniz. (Yazdıktan sonra soruları cevaplayın.)**', inline: false },
                { name: '`/kayıt-kapat`', value: '**Kayıt sistemini devre dışı bırakırsınız. (Evet ya da hayır olarak cevaplayın.)**', inline: false },
                { name: '`/kayıt-ayarlar`', value: '**Kayıt sistemini kurduktan sonra ayarlarınızı görebilirsiniz.**', inline: false },
                { name: '`/kayıt`', value: '**Kullanıcıyı normal kayıt edersiniz.**', inline: false },
                { name: '`/erkek`', value: '**Kayıt sisteminde cinsiyet bölümünü seçerseniz bu komut ile kayıt edersiniz.**', inline: false },
                { name: '`/kız`', value: '**Kayıt sisteminde cinsiyet bölümünü seçerseniz bu komut ile kayıt edersiniz.**', inline: false },
                { name: '`/kayıtsız`', value: '**Kayıtlı kullanıcıyı kayıtsıza atarsınız.**', inline: false },
                { name: '`/kayıt-bilgi`', value: '**Etiketlediğiniz kişinin kayıt bilgilerini görürsünüz.**', inline: false },
                { name: '`/kayıt-sayı`', value: '**Etiketlediğiniz yetkilinin ve tüm yetkililerin kaç kişi kayıt ettiğini görürsünüz.**', inline: false },
                { name: '`/sonkayıtlar`', value: '**Sunucudaki Son Kayıtları Görürsünüz**', inline: false },
                { name: '`/hgetiket`', value: '**Kullanıcı sunucuya girdiğinde botun attığı kişi ve yetkili rol etiketini açıp kapatırsınız.**', inline: false },
                { name: '`/sembol-ayarla`', value: '**Kayıt sistemini kurduktan sonra isterseniz sembolü değiştirebilir ya da kapatabilirsiniz.**', inline: false },
                { name: '`/tagayarla`', value: '**Kayıt sistemini kurduktan sonra isterseniz tagi değiştirebilir ya da kapatabilirsiniz.**', inline: false },
                { name: '`/tag`', value: '**Eğer ayarlıysa sunucunun tagini atar.**', inline: false },
                { name: '`/kayıt-sayı-ekle`', value: '**Bir kayıt yetkilisine ait kayıtsayıya ekleme yapabilirsiniz.**', inline: false },
                { name: '`/kayıtsayısil`', value: '**Bir kayıt yetkilisine ait kayıtsayıda eksiltme yapabilirsiniz.**', inline: false },
                { name: '`/kayıtsayısıfırla`', value: '**Bir kayıt yetkilisine ait kayıtsayıyı ya da bütün kayıt yetkililerine ait kayıtsayıları sıfırlayabilirsiniz**', inline: false },
                { name: '`/ping`', value: '**Botun Pingini Görürsünüz.**', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'has.dev Kayıt Botu Yardım Menüsü' })
            .setThumbnail(userAvatarUrl); // Profil fotoğrafını embed’e ekleme

        try {
            await interaction.reply({
                embeds: [embed],
                ephemeral: false
            });
        } catch (error) {
            console.error('Help komutu çalıştırılırken bir hata oluştu:', error);
            await interaction.reply({
                content: 'Yardım komutu çalıştırılırken bir hata oluştu.',
                ephemeral: true
            });
        }
    },
};
