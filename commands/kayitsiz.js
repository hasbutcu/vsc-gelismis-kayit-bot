const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getConfig } = require('../utils/configUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıtsız')
        .setDescription('Belirtilen kişiye kayıtsız rolü verir ve diğer rollerini alır.')
        .addUserOption(option =>
            option.setName('kişi')
                .setDescription('Rol verilecek kişi')
                .setRequired(true)),
    async execute(interaction) {
        // Yönetici yetkisi kontrolü
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.',
                ephemeral: true
            });
        }

        // Konfigürasyonu al
        const config = await getConfig(interaction.guild.id);

        if (!config) {
            return interaction.reply('Kayıt sistemi ayarları bulunamadı. Lütfen /kayit-kur komutunu kullanarak sistemi kurun.');
        }

        // Rol yönetme iznini kontrol et
        const hasManageRolesPermission = interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles);
        const hasRole = config.kayitciRol !== 'geç' && interaction.member.roles.cache.has(config.kayitciRol);

        if (config.kayitciRol !== 'geç' && !hasRole && !hasManageRolesPermission) {
            return interaction.reply('Bu komutu kullanma yetkiniz yok.');
        }

        // Kullanıcıyı al
        const kisi = interaction.options.getUser('kişi');
        if (!kisi) {
            return interaction.reply('Geçersiz üye.');
        }

        let member;
        if (kisi) {
            member = await interaction.guild.members.fetch(kisi.id).catch(() => null);
        }

        if (!member) {
            return interaction.reply('Geçersiz üye.');
        }

        // Kayıtsız rolünü al
        const kayitsizRol = interaction.guild.roles.cache.get(config.kayitsizRol);

        if (!kayitsizRol) {
            return interaction.reply('Kayıtsız rolü bulunamadı.');
        }

        // Botun rol yönetme iznini kontrol et
        const botMember = interaction.guild.members.me;
        if (!botMember || !botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply('Botun rol yönetme izni yok.');
        }

        try {
            // Kullanıcının tüm rollerini kaldır (kayıtsız rolü hariç)
            const rolesToRemove = member.roles.cache.filter(role => role.id !== kayitsizRol.id);
            await member.roles.remove(rolesToRemove);
            if (config.otoIsim) {
                try {
                    const tag = config.tag || '';
                    const newName = `${tag} Kayıtsız`;
                    await member.setNickname(newName);
                } catch (error) {
                    console.error('Kullanıcı adını değiştirirken bir hata oluştu:', error);
                }
            }

            // Kayıtsız rolü ekle
            if (!member.roles.cache.has(kayitsizRol.id)) {
                await member.roles.add(kayitsizRol);
            }
        } catch (error) {
            console.error('Rol değiştirme hatası:', error);
            return interaction.reply('Rolleri değiştirme sırasında bir hata oluştu.');
        }

        // Embed mesajını oluştur
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Kayıtsız Rol Verme Başarılı!')
            .setDescription(`Başarıyla ${member} kullanıcısının bütün rolleri alındı ve ${kayitsizRol} rolü verildi.`)
            .addFields([
                { name: 'İşlemi Gerçekleştiren Yetkili', value: `${interaction.member}` },
            ])
            .setFooter({ text: 'xxxx Kayıt Sistemi' })
            .setTimestamp();

        await interaction.channel.send({ embeds: [embed] });

        await interaction.reply(`Başarıyla ${member} kullanıcısının rolleri alındı ve ${kayitsizRol} rolü verildi.`);
    },
};
