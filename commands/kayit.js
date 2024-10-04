const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getConfig } = require('../utils/configUtils');

// Sunucu adına uygun ve güvenli bir dosya adı oluşturur
const getSanitizedServerName = (guildId) => {
    return guildId.replace(/[^a-zA-Z0-9-_]/g, '_'); // Geçersiz karakterleri temizler
};

// JSON dosyasını okuyan ve güncellenmiş verileri döndüren fonksiyon
const readKayıtBilgileri = (guildId) => {
    const sanitizedServerName = getSanitizedServerName(guildId);
    const filePath = path.join(__dirname, `../data/${sanitizedServerName}-kayitbilgileri.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return {};
};

// JSON dosyasını güncellemeye yardımcı olacak fonksiyon
const updateKayıtBilgileri = (guildId, userId, kayıtBilgileri) => {
    const sanitizedServerName = getSanitizedServerName(guildId);
    const filePath = path.join(__dirname, `../data/${sanitizedServerName}-kayitbilgileri.json`);
    let data = readKayıtBilgileri(guildId);

    data[userId] = kayıtBilgileri;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıt')
        .setDescription('Belirtilen üyeyi kaydeder')
        .addStringOption(option =>
            option.setName('üye')
                .setDescription('Kaydedilecek üye (@etiket/ID)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('isim')
                .setDescription('Üyenin ismi')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('yas')
                .setDescription('Üyenin yaşı')
                .setRequired(false)),
    async execute(interaction) {
        const config = await getConfig(interaction.guild.id);

        if (!config) {
            return interaction.reply('Kayıt sistemi ayarları bulunamadı. Lütfen /kayit-kur komutunu kullanarak sistemi kurun.');
        }

        if (config.kayitTuru === 'cinsiyet') {
            return interaction.reply('Bu komut yalnızca "normal" kayıt türü için kullanılabilir. Lütfen /erkek veya /kız komutlarını kullanın.');
        }

        if (interaction.channel.id !== config.kayitKanal) {
            return interaction.reply(`Bu komutu sadece <#${config.kayitKanal}> kanalında kullanabilirsiniz.`);
        }

        const hasManageRolesPermission = interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles);
        const hasRole = config.kayitciRol !== 'geç' && interaction.member.roles.cache.has(config.kayitciRol);

        if (config.kayitciRol !== 'geç' && !hasRole && !hasManageRolesPermission) {
            return interaction.reply('Bu komutu kullanma yetkiniz yok.');
        }

        const üyeString = interaction.options.getString('üye');
        const isim = interaction.options.getString('isim');
        const yas = interaction.options.getString('yas') || '';

        let member;
        if (üyeString.startsWith('<@') && üyeString.endsWith('>')) {
            // @etiket formatı
            const userId = üyeString.slice(2, -1); // <@ID> -> ID
            member = await interaction.guild.members.fetch(userId).catch(() => null);
        } else {
            // ID formatı
            member = await interaction.guild.members.fetch(üyeString).catch(() => null);
        }

        if (!member) {
            return interaction.reply('Geçersiz üye.');
        }

        const kayitsizRol = interaction.guild.roles.cache.get(config.kayitsizRol);
        const kayitRol = interaction.guild.roles.cache.get(config.kayitRol);

        if (!kayitsizRol || !kayitRol) {
            return interaction.reply('Kayıt rolü veya kayıtsız rolü bulunamadı.');
        }

        const botMember = interaction.guild.members.me;
        if (!botMember || !botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply('Botun rol yönetme izni yok.');
        }

        if (!member.roles.cache.has(kayitsizRol.id)) {
            return interaction.reply('Bu üye zaten kayıtlı veya kayıtsız rolü bulunmuyor.');
        }

        let yeniIsim = isim;
        if (config.tag) {
            yeniIsim = `${config.tag} ${yeniIsim}`;
        }
        if (config.sembol && yas) {
            yeniIsim = `${yeniIsim} ${config.sembol} ${yas}`;
        } else if (yas) {
            yeniIsim = `${yeniIsim} ${yas}`;
        }
        await interaction.deferReply();
        try {
            if (member.roles.cache.has(kayitsizRol.id)) {
                await member.roles.remove(kayitsizRol);
            }

            if (!member.roles.cache.has(kayitRol.id)) {
                await member.roles.add(kayitRol);
            }

            await member.setNickname(yeniIsim);

            // Kayıt bilgilerini JSON dosyasına ekle
            const kayıtBilgileri = {
                öncekiİsimler: [member.user.username],
                katılımTarihi: member.joinedAt.toISOString(),
                kayıtEden: interaction.user.id,
                kayıtTarihi: new Date().toISOString(),
                kayıtKanal: interaction.channel.id,
                dahaÖnceKaydedildiMi: Object.keys(readKayıtBilgileri(interaction.guild.id)).includes(member.id) ? 'Evet' : 'Hayır'
            };

            updateKayıtBilgileri(interaction.guild.id, member.id, kayıtBilgileri);

        } catch (error) {
            console.error('Rol değiştirme veya isim güncelleme hatası:', error);
            return interaction.reply('Rolleri değiştirme veya ismi güncelleme sırasında bir hata oluştu.');
        }

        const mesajKanal = interaction.guild.channels.cache.get(config.mesajKanal);
        if (!mesajKanal) {
            return interaction.reply('Kayıt mesajları kanalı bulunamadı.');
        }

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Kayıt Yapıldı!')
            .setDescription(`**${member} aramıza <@&${config.kayitRol}> Rolüyle Katıldı🎉**`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: `**<a:sariyildiz:1269997704742961244> • Kaydı gerçekleştiren yetkili** `, value: `> <@${interaction.user.id}>`, inline: true },
                { name: '**<a:kacov:1270002417521397834> • Aramıza hoş geldin**', value: `> <@${member.user.id}>`, inline: true }
            )
            .setTimestamp()
            .setFooter({ 
                text: 'VSC kayıt sistemi', 
                iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
            });

        const benimembed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Kayıt Bilgileri')
            .setDescription(
                `> **Kayıt Bilgileri**\n` +
                `**• Kayıt Edilen Kullanıcı:** <@${member.user.id}>\n` +
                `**• Kayıt Eden Kullanıcı:** <@${interaction.user.id}>\n` +
                `**• Verilen Roller:** <@&${config.kayitRol}>\n` +
                `**• Yeni İsim:** \`${yeniIsim}\`\n` +
                `**• Kayıt Türü:** \`Normal\``
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ 
                text: 'VSC kayıt sistemi', 
                iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
            });

        await mesajKanal.send({ embeds: [embed] });
        await interaction.editReply({embeds: [benimembed] });
    },
};
