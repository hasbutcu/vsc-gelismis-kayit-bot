const config = require('../config.json');
const allowedGuildIds = config.sunucular;
const tip = config.tip;

module.exports = {
    name: 'guildCreate',
    execute(guild) {
        console.log(`Bot yeni bir sunucuya eklendi: ${guild.name} (ID: ${guild.id})`);
        

        // Eğer tip 'public' ise, direkt devam et
        if (tip === "public") {
            console.log('Tip public, sunucu ID kontrolü yapılmadı.');
            return;
        }
        else{
            console.log(`Bot Tipi ${tip} = public olmadığı için id'si belirtilmemiş sunuculardan çıkılıcak`)
        }

        // Eğer tip 'public' değilse, allowedGuildIds'i kontrol et
        if (!allowedGuildIds.includes(guild.id)) {
            console.log(`Bot bu sunucuya eklenemez. Sunucudan çıkılıyor: ${guild.name}`);
            guild.leave()
                .then(g => console.log(`Bot şu sunucudan ayrıldı: ${g.name}`))
                .catch(err => console.error(`Sunucudan çıkarken hata oluştu: ${err}`));
        }
    },
};
