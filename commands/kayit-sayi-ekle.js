const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { getServerData, setServerData } = require('../utils/dataUtils'); // Sunucuya özel veri dosyası ile etkileşim için

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıt-sayı-ekle')
        .setDescription('Belirli bir kişinin kayıt sayısını artırır.')
        .addUserOption(option => 
            option.setName('kişi')
                .setDescription('Kayıt sayısını artırılacak kişi')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('adet')
                .setDescription('Eklenecek kayıt sayısı')
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

        // Kullanıcı ve ekleme miktarını al
        const user = interaction.options.getUser('kişi');
        const adet = interaction.options.getInteger('adet');

        if (adet <= 0) {
            return interaction.reply({
                content: 'Eklenecek miktar sıfır veya negatif olamaz.',
                ephemeral: true
            });
        }

        // Sunucuya özel veri dosyasını al
        const serverData = await getServerData(interaction.guild.id);
        if (!serverData) {
            return interaction.reply({
                content: 'Veri dosyası alınamadı. Lütfen tekrar deneyin.',
                ephemeral: true
            });
        }

        // Kayıt sayıları nesnesini oluştur veya güncelle
        const kayitSayilari = serverData || {};
        const userId = user.id;

        // Kişinin kayıt sayısını güncelle
        if (!kayitSayilari[userId]) {
            kayitSayilari[userId] = 0;
        }
        kayitSayilari[userId] += adet;

        // Yeni veriyi sunucuya özel dosyaya yaz
        try {
            await setServerData(interaction.guild.id, kayitSayilari);

            // Başarı mesajını gönder
            await interaction.reply({
                content: `${user.username} kullanıcısının kayıt sayısına ${adet} eklendi. Toplam kayıt sayısı: ${kayitSayilari[userId]}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Kayıt sayısı eklenirken bir hata oluştu:', error);
            await interaction.reply({
                content: 'Kayıt sayısı eklenirken bir hata oluştu.',
                ephemeral: true
            });
        }
    },
};
