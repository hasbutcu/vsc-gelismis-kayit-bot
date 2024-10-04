const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { setConfig, getConfig } = require('../utils/configUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıt-kur')
        .setDescription('Kayıt sistemini kurar'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.',
                ephemeral: true
            });
        }

        await interaction.reply('Lütfen bu mesajı kayıtların gerçekleştirileceği kanalı etiketleyerek cevaplayın. `#kanal`');

        const filter = response => response.author.id === interaction.user.id;
        const collectedChannel = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
        const kayitKanal = collectedChannel.first().mentions.channels.first()?.id;
        if (!kayitKanal) {
            return interaction.followUp('Kayıt kanalı ayarlanamadı. Lütfen tekrar deneyin.');
        }

        await interaction.followUp('Lütfen bu mesajı kayıt türünü belirterek cevaplayınız. `normal/cinsiyet`');
        const collectedType = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
        const kayitTuru = collectedType.first().content.toLowerCase();
        if (kayitTuru !== 'normal' && kayitTuru !== 'cinsiyet') {
            return interaction.followUp('Kayıt türü geçersiz. Lütfen `normal` veya `cinsiyet` olarak cevaplayın.');
        }

        let kayitRol = null, kayitsizRol = null, kayitciRol = null;
        if (kayitTuru === 'normal') {
            await interaction.followUp('Bu mesajı kayıtlı üye rolünü etiketleyerek cevaplayın. `@rol`');
            const collectedRol = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
            kayitRol = collectedRol.first().mentions.roles.first()?.id;
            if (!kayitRol) {
                return interaction.followUp('Kayıtlı üye rolü ayarlanamadı. Lütfen tekrar deneyin.');
            }

            await interaction.followUp('Bu mesajı kayıtsız üye rolünü etiketleyerek cevaplayın. `@rol`');
            const collectedKayitsizRol = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
            kayitsizRol = collectedKayitsizRol.first().mentions.roles.first()?.id;
            if (!kayitsizRol) {
                return interaction.followUp('Kayıtsız üye rolü ayarlanamadı. Lütfen tekrar deneyin.');
            }
        } else if (kayitTuru === 'cinsiyet') {
            await interaction.followUp('Bu mesajı kız rolünü etiketleyerek cevaplayın. `@rol`');
            const collectedKizRol = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
            const kizRol = collectedKizRol.first().mentions.roles.first()?.id;
            if (!kizRol) {
                return interaction.followUp('Kız rolü ayarlanamadı. Lütfen tekrar deneyin.');
            }

            await interaction.followUp('Bu mesajı erkek rolünü etiketleyerek cevaplayın. `@rol`');
            const collectedErkekRol = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
            const erkekRol = collectedErkekRol.first().mentions.roles.first()?.id;
            if (!erkekRol) {
                return interaction.followUp('Erkek rolü ayarlanamadı. Lütfen tekrar deneyin.');
            }

            kayitRol = { kiz: kizRol, erkek: erkekRol };

            await interaction.followUp('Bu mesajı kayıtsız üye rolünü etiketleyerek cevaplayın. `@rol`');
            const collectedKayitsizRol = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
            kayitsizRol = collectedKayitsizRol.first().mentions.roles.first()?.id;
            if (!kayitsizRol) {
                return interaction.followUp('Kayıtsız üye rolü ayarlanamadı. Lütfen tekrar deneyin.');
            }
        }

        await interaction.followUp('Bu mesajı kayıtçı üye rolünü etiketleyerek cevaplayın ya da geçin. `@rol/geç`');
        const collectedKayitciRol = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
        kayitciRol = collectedKayitciRol.first().mentions.roles.first()?.id || 'geç';
        
        await interaction.followUp('Bu mesajı kayıt yapıldıktan sonra mesajın gönderileceği kanalı etiketleyerek cevaplayın. `#kanal`');
        const collectedMesajKanal = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
        const mesajKanal = collectedMesajKanal.first().mentions.channels.first()?.id;
        if (!mesajKanal) {
            return interaction.followUp('Kayıt mesajları kanalı ayarlanamadı. Lütfen tekrar deneyin.');
        }

        await interaction.followUp('Bu mesajı kullanıcının ismi ve yaşının arasına koyulacak sembol ile cevaplayın ya da geçin. `sembol/geç`');
        const collectedSembol = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
        const sembol = collectedSembol.first().content === 'geç' ? '' : collectedSembol.first().content;

        await interaction.followUp('Bu mesajı kullanıcının isminin başına koyulacak tag ile cevaplayın ya da geçin. `tag/geç`');
        const collectedTag = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
        const tag = collectedTag.first().content === 'geç' ? '' : collectedTag.first().content;

        await interaction.followUp('Eğer otoisim sistemini kullanmak istiyorsanız evet istemiyorsanız hayır olarak mesajı cevaplayınız. `evet/hayır`');
        const collectedOtoIsim = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
        const otoIsim = collectedOtoIsim.first().content.toLowerCase() === 'evet';

        await interaction.followUp('Eğer otorol sistemini kullanmak istiyorsanız evet istemiyorsanız hayır olarak mesajı cevaplayınız. `evet/hayır`');
        const collectedOtoRol = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000 });
        const otoRol = collectedOtoRol.first().content.toLowerCase() === 'evet' ? kayitsizRol : 'Kapalı';

        // Ayarları JSON dosyasına yazın
        await setConfig(interaction.guild.id, {
            kayitKanal,
            kayitTuru,
            kayitRol,
            kayitsizRol,
            kayitciRol,
            mesajKanal,
            sembol,
            tag,
            otoIsim,
            otoRol,
            ozelMesaj: 'Özelleştirilmiş mesaj', // Bu örnekte sabit bir değer koyduk, gerçek uygulamada dinamik olabilir
        });

        // Başarı mesajını gönder
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Kurulum Başarılı!')
            .setDescription('Kurulum başarılı bir şekilde tamamlanmıştır.')
            .addFields(
                { name: 'Kayıt Kanalı', value: `<#${kayitKanal}>`, inline: true },
                { name: 'Kayıt Türü', value: kayitTuru === 'normal' ? 'Normal Kayıt' : 'Cinsiyet Kayıt', inline: true },
                { name: 'Kayıt Rol/Rolleri', value: kayitTuru === 'normal' ? `<@&${kayitRol}>` : `Kız: <@&${kayitRol.kiz}>\nErkek: <@&${kayitRol.erkek}>`, inline: true },
                { name: 'Kayıtsız Üye', value: `<@&${kayitsizRol}>`, inline: true },
                { name: 'Kayıtçı Rolü', value: kayitciRol === 'geç' ? 'Geçildi' : `<@&${kayitciRol}>`, inline: true },
                { name: 'Kayıt Mesajları Kanalı', value: `<#${mesajKanal}>`, inline: true },
                { name: 'Sembol', value: sembol || 'Sembol yok', inline: true },
                { name: 'Tag', value: tag || 'Tag yok', inline: true },
                { name: 'Otomatik İsim', value: otoIsim ? 'Açık' : 'Kapalı', inline: true },
                { name: 'Otomatik Rol', value: otoRol === 'Kapalı' ? 'Kapalı' : `<@&${otoRol}>`, inline: true },
                { name: 'Özelleştirilmiş Mesaj', value: 'Özelleştirilmiş Hoşgeldin Mesajı Yok. Açmak İçin .özelmesaj', inline: true },
                { name: 'Hoş Geldin Etiketi', value: 'Hoş Geldin Etiketi Açık', inline: true },
                { name: 'Buton Kayıt', value: 'Kapalı', inline: true },
                { name: 'İsim Yaş Gereksinim', value: 'İsim: Gerekli\nYaş: Gerekli', inline: true }
            );

        await interaction.followUp({ embeds: [embed] });
    },
};
