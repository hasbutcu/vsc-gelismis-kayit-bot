const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { readKayıtBilgileri } = require('../utils/kayitUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sonkayıtlar')
        .setDescription('Son kaydedilen kullanıcıları veya belirli bir kullanıcının kayıt geçmişini gösterir.')
        .addUserOption(option => 
            option.setName('kişi')
                .setDescription('Kayıt geçmişi gösterilecek kişi')),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.',
                ephemeral: true
            });
        }
        const kisi = interaction.options.getUser('kişi');
        const kayıtBilgileri = readKayıtBilgileri();

        // Eğer bir kullanıcı etiketlenmişse o kullanıcının kayıtlarını bul
        if (kisi) {
            const kullaniciKayıtları = Object.entries(kayıtBilgileri)
                .filter(([userId, info]) => info.kayıtEden === kisi.id)
                .map(([userId, info]) => ({
                    kaydedilen: userId,
                    kaydeden: info.kayıtEden,
                    tarih: info.kayıtTarihi
                }));

            if (kullaniciKayıtları.length === 0) {
                return interaction.reply(`${kisi.tag} kullanıcısının kayıt geçmişi bulunamadı.`);
            }

            const embed = new EmbedBuilder()
                .setTitle(`${kisi.tag} Kullanıcısının Son Kayıtları`)
                .setColor('#00FF00')
                .setTimestamp();

            for (const kayıt of kullaniciKayıtları) {
                const kaydedenKullanici = await interaction.guild.members.fetch(kayıt.kaydeden);
                embed.addFields({
                    name: 'Kayıt',
                    value: `**Kayıt Edilen:** <@${kayıt.kaydedilen}>\n**Kayıt Eden:** ${kaydedenKullanici.user.tag}\n**Kayıt Tarihi:** ${new Date(kayıt.tarih).toLocaleString()}`
                });
            }

            return interaction.reply({ embeds: [embed] });

        } else {
            // Kullanıcı belirtilmemişse, son kaydedilen kullanıcıları göster
            const sonKayıtlar = Object.entries(kayıtBilgileri)
                .sort((a, b) => new Date(b[1].kayıtTarihi) - new Date(a[1].kayıtTarihi))
                .slice(0, 10) // Son 10 kaydı al
                .map(([userId, info]) => ({
                    kaydedilen: userId,
                    kaydeden: info.kayıtEden,
                    tarih: info.kayıtTarihi
                }));

            if (sonKayıtlar.length === 0) {
                return interaction.reply('Kayıt bilgisi bulunamadı.');
            }

            const embed = new EmbedBuilder()
                .setTitle('Son Kaydedilen Kullanıcılar')
                .setColor('#00FF00')
                .setTimestamp();

            for (const kayıt of sonKayıtlar) {
                const kaydedenKullanici = await interaction.guild.members.fetch(kayıt.kaydeden);
                embed.addFields({
                    name: 'Kayıt',
                    value: `**Kayıt Edilen:** <@${kayıt.kaydedilen}>\n**Kayıt Eden:** ${kaydedenKullanici.user.tag}\n**Kayıt Tarihi:** ${new Date(kayıt.tarih).toLocaleString()}`
                });
            }

            return interaction.reply({ embeds: [embed] });
        }
    },
};
