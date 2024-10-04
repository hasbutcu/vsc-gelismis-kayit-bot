const fs = require('fs');
const path = require('path');

// JSON dosyasını okuyan fonksiyon
const readJSONFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return {};
};

// JSON dosyasını güncellemeye yardımcı olacak fonksiyon
const writeJSONFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Sunucuya özel veri dosyasını okuma
const getServerData = async (guildId) => {
    const filePath = path.join(__dirname, '../data', `${guildId}-yetkilikayitsayisi.json`);
    return readJSONFile(filePath);
};

// Sunucuya özel veri dosyasını güncelleme
const setServerData = async (guildId, data) => {
    const filePath = path.join(__dirname, '../data', `${guildId}-yetkilikayitsayisi.json`);
    writeJSONFile(filePath, data);
};

// Kayıt sayısını güncelleme
const updateKayıtSayısı = async (guildId, userId, yeniSayısı) => {
    const serverData = await getServerData(guildId);
    const kayitSayilari = serverData || {};

    // Kullanıcının kayıt sayısını güncelle
    kayitSayilari[userId] = yeniSayısı;
    await setServerData(guildId, kayitSayilari);
};

module.exports = {
    getServerData,
    setServerData,
    updateKayıtSayısı
};
