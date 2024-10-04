const fs = require('fs').promises;
const path = require('path');

// Sunucu adına uygun ve güvenli bir dosya adı oluşturur
const getSanitizedServerName = (serverName) => {
    if (!serverName) {
        throw new Error('Geçersiz sunucu adı: ' + serverName);
    }
    return serverName.replace(/[^a-zA-Z0-9-_]/g, '_'); // Geçersiz karakterleri temizler
};

// Ayarları JSON dosyasına yazan fonksiyon
const setConfig = async (guildId, config) => {
    try {
        const sanitizedServerName = getSanitizedServerName(guildId);
        const filePath = path.join(__dirname, `../data/${sanitizedServerName}-ayarg.json`);

        await fs.writeFile(filePath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
        console.error('Ayarlar yazılırken bir hata oluştu:', error);
        throw error;
    }
};

// Ayarları JSON dosyasından okuyan fonksiyon
const getConfig = async (guildId) => {
    try {
        const sanitizedServerName = getSanitizedServerName(guildId);
        const filePath = path.join(__dirname, `../data/${sanitizedServerName}-ayarg.json`);

        if (!await fileExists(filePath)) {
            return null;
        }

        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Ayarlar okunurken bir hata oluştu:', error);
        return null;
    }
};

// Dosyanın var olup olmadığını kontrol eden yardımcı fonksiyon
const fileExists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
};

module.exports = { setConfig, getConfig };
