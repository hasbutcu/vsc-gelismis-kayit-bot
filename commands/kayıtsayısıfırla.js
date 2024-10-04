const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { getServerData, setServerData } = require('../utils/dataUtils'); // Sunucuya özel veri dosyası ile etkileşim için

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıt-sayı-sıfırla')
        .setDescription('Belirli bir kişinin kayıt sayısını sıfırlar.')
        .addUserOption(option => 
            option.setName('kişi')
                .setDescription('Kayıt sayısını sıfırlanacak kişi')
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

        // Kullanıcıyı al
        const user = interaction.options.getUser('kişi');

        // Sunucuya özel veri dosyasını al
        const serverData = await getServerData(interaction.guild.id);
        const kayitSayilari = serverData || {};
        const userId = user.id;

        // Kullanıcının kayıt sayısını sıfırla
        if (!kayitSayilari[userId]) {
            kayitSayilari[userId] = 0;
        }

        kayitSayilari[userId] = 0;

        // Yeni veriyi sunucuya özel dosyaya yaz
        try {
            await setServerData(interaction.guild.id, kayitSayilari);

            // Başarı mesajını gönder
            await interaction.reply({
                content: `${user.username} kullanıcısının kayıt sayısı sıfırlandı.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Kayıt sayısı sıfırlanırken bir hata oluştu:', error);
            await interaction.reply({
                content: 'Kayıt sayısı sıfırlanırken bir hata oluştu.',
                ephemeral: true
            });
        }
    },
};
