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

// Kayıt bilgilerini okuma
const readKayıtBilgileri = (guildId) => {
    const filePath = path.join(__dirname, `../data/${guildId}-kayitbilgileri.json`);
    return readJSONFile(filePath);
};

// Kayıt bilgilerini güncelleme
const updateKayıtBilgileri = (guildId, userId, kayıtBilgileri) => {
    const filePath = path.join(__dirname, `../data/${guildId}-kayitbilgileri.json`);
    let data = readKayıtBilgileri(guildId);
    data[userId] = kayıtBilgileri;
    writeJSONFile(filePath, data);
};

// Yetkili kayıt sayısını okuma
const readYetkiliKayıtSayısı = (guildId) => {
    const filePath = path.join(__dirname, `../data/${guildId}-yetkilikayitsayisi.json`);
    return readJSONFile(filePath);
};

// Yetkili kayıt sayısını güncelleme
const updateYetkiliKayıtSayısı = (guildId, userId) => {
    const filePath = path.join(__dirname, `../data/${guildId}-yetkilikayitsayisi.json`);
    let data = readYetkiliKayıtSayısı(guildId);
    
    if (data[userId]) {
        data[userId]++;
    } else {
        data[userId] = 1;
    }
    
    writeJSONFile(filePath, data);
};

module.exports = {
    readKayıtBilgileri,
    updateKayıtBilgileri,
    readYetkiliKayıtSayısı,
    updateYetkiliKayıtSayısı
};
