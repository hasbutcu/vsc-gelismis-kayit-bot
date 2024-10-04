const { Events, EmbedBuilder } = require('discord.js');
const { getConfig } = require('../utils/configUtils');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            const guildId = member.guild.id; // Sunucu ID'sini al
            const config = await getConfig(guildId); // Sunucu ID'sini geç

            if (!config) {
                console.error('Kayıt sistemi ayarları bulunamadı.');
                return;
            }

            // Hoş geldin mesajının gönderileceği kanal
            const kayitKanal = member.guild.channels.cache.get(config.kayitKanal);
            if (!kayitKanal) {
                console.error('Hoş geldin mesajı gönderilecek kanal bulunamadı.');
                return;
            }

            // Kayıtçı rolü
            const kayitciRol = config.kayitciRol === 'geç' ? null : member.guild.roles.cache.get(config.kayitciRol);

            // Hesap oluşturulma tarihini formatlama
            const accountCreationDate = member.user.createdAt.toLocaleString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Embed oluşturma
            const embed = new EmbedBuilder()
                .setColor(0x00FF00) // Renk kodunu integer olarak belirtin
                .setTitle(`Yeni Bir Kullanıcı Katıldı, ${member.user.username} `)
                .setDescription(
                    `**<a:kacov:1270002417521397834> ${member} aramıza katıldı! 🎉**\n\n` +
                    `**<a:maviyildiz:1269997596311683257> Seninle birlikte ${member.guild.memberCount} kişiyiz.**\n\n` +
                    `> **<a:green_arrow:1269996212124254229> Hesap Oluşturulma Tarihi:** **\`${accountCreationDate}\`**\n\n` +
                    `> **<a:susp:1270002831008469085> Güvenilirlik Durumu:** ` +
                    (member.user.createdAt > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 3) ? 
                     `**<a:tik2:1269997662422437949> \`Güvenilir\`**` : 
                     `**<:warn:1269997722492997653> \`Güvenilir değil\`**`)
                )
                
                .setTimestamp()
                .setThumbnail(member.user.displayAvatarURL({ size: 1024, dynamic: true })); // Profil fotoğrafını küçük bir şekilde gösterir

            // Hoş geldin mesajını gönder
            try {
                if (kayitciRol) {
                    await kayitKanal.send({
                        content: `${kayitciRol.toString()}, ${member} sunucuya katıldı! \n ${member} Lütfen isim ve yaşınızı yazıp yetkilileri bekleyiniz. 🎉`,
                        embeds: [embed]
                    });
                } else {
                    await kayitKanal.send({
                        content: `${member} sunucuya katıldı! 🎉`,
                        embeds: [embed]
                    });
                }
            } catch (error) {
                console.error('Mesaj ve embed gönderilirken bir hata oluştu:', error);
            }

            // Eğer otoIsim açık ise kullanıcı adını değiştir
            if (config.otoIsim) {
                try {
                    const tag = config.tag || '';
                    const newName = `${tag} Kayıtsız`;
                    await member.setNickname(newName);
                } catch (error) {
                    console.error('Kullanıcı adını değiştirirken bir hata oluştu:', error);
                }
            }

            // Eğer otoRol açık ise kullanıcıya rol ver
            if (config.otoRol && config.otoRol !== 'Kapalı') {
                const role = member.guild.roles.cache.get(config.otoRol);
                if (role) {
                    try {
                        await member.roles.add(role);
                        console.log(`Rol '${role.name}' ${member.user.tag} kullanıcısına verildi.`);
                    } catch (error) {
                        console.error('Rol eklenirken bir hata oluştu:', error);
                    }
                } else {
                    console.error('Oto rol bulunamadı.');
                }
            }
        } catch (error) {
            console.error('Hata oluştu:', error);
        }
    },
};
