const cache = new Map();
let counter = 0;

function storeSettings(settings) {
    const id = (counter++ % 1000).toString(); // Rotate through 0-999
    cache.set(id, settings);
    // Delete after 5 minutes
    setTimeout(() => cache.delete(id), 5 * 60 * 1000);
    return id;
}

function getSettings(id) {
    return cache.get(id);
}

module.exports = { storeSettings, getSettings };
