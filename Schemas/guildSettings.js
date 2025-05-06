const mongoose = require('mongoose');

const guildSettingsSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    levelUpChannel: { type: String, default: null },
    levelUpMessage: { type: String, default: '🎉 Congratulations {user}, you leveled up to level `{level}`!' }
});

module.exports = mongoose.model('GuildSettings', guildSettingsSchema);
