const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { getServerData, updateKayıtSayısı } = require('../utils/dataUtils'); // JSON dosyası fonksiyonları içeren dosya

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıt-sayı-sil')
        .setDescription('Belirli bir kişinin kayıt sayısını azaltır.')
        .addUserOption(option => 
            option.setName('kişi')
                .setDescription('Kayıt sayısını azaltılacak kişi')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('adet')
                .setDescription('Azaltılacak kayıt sayısı')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Sadece yöneticilerin komutu kullanabilmesini sağlamak
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: 'Bu komutu kullanma izniniz yok.',
                ephemeral: true
            });
        }

        // Kullanıcı ve azaltma miktarını al
        const user = interaction.options.getUser('kişi');
        const adet = interaction.options.getInteger('adet');

        if (adet <= 0) {
            return interaction.reply({
                content: 'Azaltılacak miktar sıfır veya negatif olamaz.',
                ephemeral: true
            });
        }

        // Sunucuya özel veri dosyasını al
        const serverData = await getServerData(interaction.guild.id);
        const kayitSayilari = serverData || {};
        const userId = user.id;

        // Kişinin kayıt sayısını güncelle
        if (!kayitSayilari[userId]) {
            kayitSayilari[userId] = 0;
        }

        if (kayitSayilari[userId] < adet) {
            return interaction.reply({
                content: 'Kayıt sayısı azaltma miktarı, mevcut kayıt sayısından büyük olamaz.',
                ephemeral: true
            });
        }

        kayitSayilari[userId] -= adet;

        // Yeni veriyi sunucuya özel dosyaya yaz
        try {
            await updateKayıtSayısı(interaction.guild.id, userId, kayitSayilari[userId]);

            // Başarı mesajını gönder
            await interaction.reply({
                content: `${user.username} kullanıcısının kayıt sayısından ${adet} silindi. Toplam kayıt sayısı: ${kayitSayilari[userId]}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Kayıt sayısı silinirken bir hata oluştu:', error);
            await interaction.reply({
                content: 'Kayıt sayısı silinirken bir hata oluştu.',
                ephemeral: true
            });
        }
    },
};
