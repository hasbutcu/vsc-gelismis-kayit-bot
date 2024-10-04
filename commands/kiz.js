const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getConfig } = require('../utils/configUtils');

// JSON dosyasını okuyan ve güncellenmiş verileri döndüren fonksiyon
const readKayıtBilgileri = (guildId) => {
    const filePath = path.join(__dirname, `../data/${guildId}-kayitbilgileri.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return {};
};

// JSON dosyasını güncellemeye yardımcı olacak fonksiyon
const updateKayıtBilgileri = (guildId, userId, kayıtBilgileri) => {
    const filePath = path.join(__dirname, `../data/${guildId}-kayitbilgileri.json`);
    let data = readKayıtBilgileri(guildId);
    data[userId] = kayıtBilgileri;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kız')
        .setDescription('Kız rolü verir ve üyenin ismini günceller.')
        .addUserOption(option => 
            option.setName('kişi')
                .setDescription('Rol verilecek kişi')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('isim')
                .setDescription('Üyenin yeni ismi')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('yaş')
                .setDescription('Üyenin yaşı')
                .setRequired(false)),
    async execute(interaction) {
        const config = await getConfig(interaction.guild.id);

        if (!config) {
            return interaction.reply('Kayıt sistemi ayarları bulunamadı. Lütfen /kayit-kur komutunu kullanarak sistemi kurun.');
        }

        if (config.kayitTuru !== 'cinsiyet') {
            return interaction.reply('Bu komut yalnızca "cinsiyet" kayıt türü için kullanılabilir. Lütfen /kayıt komutunu kullanın.');
        }

        if (interaction.channel.id !== config.kayitKanal) {
            return interaction.reply(`Bu komutu sadece <#${config.kayitKanal}> kanalında kullanabilirsiniz.`);
        }

        const hasManageRolesPermission = interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles);
        const hasRole = config.kayitciRol !== 'geç' && interaction.member.roles.cache.has(config.kayitciRol);

        if (config.kayitciRol !== 'geç' && !hasRole && !hasManageRolesPermission) {
            return interaction.reply('Bu komutu kullanma yetkiniz yok.');
        }

        const kisi = interaction.options.getUser('kişi');
        const isim = interaction.options.getString('isim');
        const yas = interaction.options.getString('yaş') || '';

        let member;
        if (kisi) {
            member = await interaction.guild.members.fetch(kisi.id).catch(() => null);
        }

        if (!member) {
            return interaction.reply('Geçersiz üye.');
        }

        const kizRol = interaction.guild.roles.cache.get(config.kayitRol.kiz);
        const kayitsizRol = interaction.guild.roles.cache.get(config.kayitsizRol);

        if (!kizRol || !kayitsizRol) {
            return interaction.reply('Rol bulunamadı.');
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

            if (!member.roles.cache.has(kizRol.id)) {
                await member.roles.add(kizRol);
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
            .setDescription(`**${member} aramıza <@&${config.kayitRol.kiz}> Rolüyle Katıldı🎉**`)
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
            .setTitle('Kayıt Yapıldı!')
            .setDescription(
                `> **Kayıt Bilgileri**\n` +
                `**• Kayıt Edilen Kullanıcı: <@${member.user.id}>**\n` +
                `**• Kayıt Eden Kullanıcı: <@${interaction.user.id}>**\n` +
                `**• Verilen Roller: <@&${config.kayitRol.kiz}>**\n` +
                `**• Yeni İsim: \`${yeniIsim}\`**\n` +
                `**• Kayıt Türü: \`Kız\`**`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ 
                text: 'VSC kayıt sistemi', 
                iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
            });

        await mesajKanal.send({ embeds: [embed] });
        await interaction.editReply({ embeds: [benimembed] });
    },
};
