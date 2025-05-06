const { SlashCommandBuilder, PermissionFlagsBits, parseEmoji } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addemoji')
        .setDescription('Add emoji to your server')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji you want to add to the server')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji_name')
                .setDescription('Name of emoji')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers),
    example: '/addemoji **emoji:**🙄',
    category: 'mod',
    async execute(interaction) {
        const emoji = interaction.options.getString('emoji');
        const emojiName = interaction.options.getString('emoji_name');
        const parseCustomEmoji = parseEmoji(emoji);

        if (parseCustomEmoji?.id) {
            const extension = parseCustomEmoji.animated ? 'gif' : 'png';
            const emojiLink = `https://cdn.discordapp.com/emojis/${parseCustomEmoji.id}.${extension}`;
            
            try {
                const createdEmoji = await interaction.guild.emojis.create({ 
                    attachment: emojiLink, 
                    name: emojiName || parseCustomEmoji.name 
                });
                
                await interaction.reply({
                    content: `Added ${createdEmoji} emoji`,
                });
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: `❌ Failed to add emoji - make sure I have permissions and the server has emoji slots available`,
                    ephemeral: true
                });
            }
        } else {
            await interaction.reply({
                content: `❌ Not a valid emoji`,
                ephemeral: true,
            });
        }
    },
};