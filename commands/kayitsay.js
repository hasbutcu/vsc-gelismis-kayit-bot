const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { readYetkiliKayıtSayısı } = require('../utils/kayitUtils'); // JSON dosyası fonksiyonları içeren dosya

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıt-say')
        .setDescription('Yetkililerin kayıt sayısını gösterir.'),
    async execute(interaction) {
        // Yönetici yetkisi kontrolü
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.',
                ephemeral: true
            });
        }

        // Sunucu ID'sini al
        const guildId = interaction.guild.id;

        // Sunucuya özel kayıt sayısı verilerini oku
        const data = readYetkiliKayıtSayısı(guildId);

        // Embed mesajını oluştur
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Yetkili Kayıt Sayıları')
            .setDescription('Yetkililerin yaptığı kayıt sayıları:')
            .setTimestamp();

        // Yetkili kayıt sayılarını embed mesajına ekle
        for (const [userId, count] of Object.entries(data)) {
            const user = await interaction.guild.members.fetch(userId).catch(() => null);
            const userTag = user ? user.user.tag : 'Tanınmıyor';
            embed.addFields({ name: userTag, value: `Kayıt Sayısı: ${count}`, inline: true });
        }

        // Embed mesajını gönder
        await interaction.reply({ embeds: [embed] });
    },
};
