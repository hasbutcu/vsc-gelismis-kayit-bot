const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { getConfig, setConfig } = require('../utils/configUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tagayarla')
        .setDescription('Sunucunun tagını ayarlar.')
        .addStringOption(option =>
            option.setName('tag')
                .setDescription('Ayarlanacak tag')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply('Bu komutu kullanma yetkiniz yok.');
        }
        try {
            // Tag değerini al
            const tag = interaction.options.getString('tag');
            
            // Sunucu ayarlarını al
            let config = await getConfig(interaction.guild.id);
            if (!config) {
                config = {};
            }

            // Tag değerini güncelle
            config.tag = tag;

            // Yeni konfigürasyonu dosyaya yaz
            await setConfig(interaction.guild.id, config);

            // Başarı mesajı gönder
            await interaction.reply({
                content: `Sunucunun tagı başarıyla \`${tag}\` olarak ayarlandı.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Tag ayarlarken bir hata oluştu:', error);
            await interaction.reply({
                content: 'Tag ayarlarken bir hata oluştu.',
                ephemeral: true
            });
        }
    },
};
