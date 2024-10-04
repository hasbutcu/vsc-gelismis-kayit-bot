const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıt-bilgi')
        .setDescription('Belirtilen kişinin kayıt bilgilerini gösterir.')
        .addUserOption(option =>
            option.setName('kişi')
                .setDescription('Kayıt bilgilerini göreceğiniz kişi')
                .setRequired(true)),
    async execute(interaction) {
        // Yöneticilik iznini kontrol et
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.',
                ephemeral: true
            });
        }

        // Sunucuya özgü dosya yolunu oluştur
        const serverId = interaction.guild.id;
        const filePath = path.join(__dirname, `../data/${serverId}-kayitbilgileri.json`);

        // Kullanıcıyı al
        const kisi = interaction.options.getUser('kişi');
        let member;

        if (kisi) {
            member = await interaction.guild.members.fetch(kisi.id).catch(() => null);
        }

        if (!member) {
            return interaction.reply('Geçersiz üye.');
        }

        // Dosyanın mevcut olup olmadığını kontrol et
        if (!fs.existsSync(filePath)) {
            return interaction.reply('Kayıt bilgileri bulunamadı.');
        }

        // JSON dosyasını oku
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const kayıtBilgileri = data[member.id];

        if (!kayıtBilgileri) {
            return interaction.reply('Bu kullanıcı daha önce kaydedilmemiş.');
        }

        // Embed mesajını oluştur
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`${member.user.tag} Kayıt Bilgileri`)
            .addFields([
                { name: 'Kullanıcının Önceki İsimleri', value: kayıtBilgileri.oncekiIsimler || 'Bilgi Yok', inline: true },
                { name: 'Katılım Tarihi', value: member.joinedAt.toDateString(), inline: true },
                { name: 'Kayıt Eden Kullanıcı', value: `<@${kayıtBilgileri.kayıtEden}>`, inline: true },
                { name: 'Kayıt Tarihi', value: new Date(kayıtBilgileri.kayıtTarihi).toDateString(), inline: true },
                { name: 'Kayıt Kanalı', value: `<#${kayıtBilgileri.kayıtKanal}>`, inline: true },
                { name: 'Daha Önce Kaydedilmiş Mi?', value: 'Evet', inline: true }
            ])
            .setFooter({ text: 'has.dev Kayıt Sistemi' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
