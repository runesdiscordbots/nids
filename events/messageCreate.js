const db = require('../Schemas/manager');

module.exports = {
    name: 'messageCreate',

    async execute(message) {
        if (!message.author.bot) {
            // Get the user from the database
            const { user } = await db.getUserById(message.author.id);

            // Generate a random XP value between 1 and 5
            const xp = Math.ceil(Math.random() * (1 * 5));

            // Function to calculate the user's level based on their XP
            const calculateUserXp = (xp) => Math.floor(0.1 * Math.sqrt(xp));

            // Calculate the user's current level
            const level = calculateUserXp(user.xp);

            // Calculate the user's new level if they gain the XP
            const newLevel = calculateUserXp(user.xp + xp);

            // Check if the user leveled up
            if (newLevel > level) {
                // Get guild settings
                const guildSettings = await db.getGuildSettings(message.guild.id);
                const levelChannel = guildSettings?.levelUpChannel 
                    ? message.guild.channels.cache.get(guildSettings.levelUpChannel)
                    : message.channel;

                // Get message template or use default
                const template = guildSettings?.levelUpMessage || '🎉 Congratulations {user}, you leveled up to level `{level}`!';
                const levelMessage = template
                    .replace('{user}', message.author.toString())
                    .replace('{level}', newLevel);

                // Send level up message and delete it after delay
                const msg = await levelChannel.send(levelMessage);
                setTimeout(() => {
                    msg?.delete();
                }, 80000);
            }

            // Update the user's XP in the database
            await db.updateUserById(message.author.id, {
                xp: user.xp + xp,
            });
        }
    }
};