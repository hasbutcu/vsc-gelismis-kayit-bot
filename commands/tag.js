const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getConfig } = require('../utils/configUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Sunucunun tagını gösterir.'),

    async execute(interaction) {
        try {
            // Sunucu ayarlarını al
            const config = await getConfig(interaction.guild.id);
            if (!config) {
                return await interaction.reply({
                    content: 'Sunucu ayarları bulunamadı.',
                    ephemeral: true
                });
            }

            // Tag ayarlı mı kontrol et
            const tag = config.tag;
            if (!tag || tag === 'Kapalı') {
                return await interaction.reply({
                    content: 'Sunucu tagı ayarlanmamış veya kapalı.',
                    ephemeral: true
                });
            }


            // Embed'i kullanıcıya gönderme
            await interaction.reply(`\`${tag}\``)
        } catch (error) {
            console.error('Tag komutu çalıştırılırken bir hata oluştu:', error);
            await interaction.reply({
                content: 'Tag komutu çalıştırılırken bir hata oluştu.',
                ephemeral: true
            });
        }
    },
};
