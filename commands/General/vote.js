const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Collection } = require('discord.js');

const cooldowns = new Collection();
const COOLDOWN_DURATION = 16; // 16 seconds cooldown

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Vote for our bot on various bot lists!'),
    timeout: 3000,
    category: 'general',
    async execute(interaction) {
        const userId = interaction.user.id;
        const now = Date.now();
        const cooldownEnd = cooldowns.get(userId);

        if (cooldownEnd && now < cooldownEnd) {
            const remainingTime = Math.ceil((cooldownEnd - now) / 1000);
            return interaction.reply({ 
                content: `${interaction.user.username}, Cool down (${remainingTime} seconds left)`,
                ephemeral: true 
            });
        }

        cooldowns.set(userId, now + (COOLDOWN_DURATION * 1000));

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('🤗 Vote Link')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discordbotlist.com/bots/voryxbot')
            );

        await interaction.reply({ content: ':tada: You are eligible to vote for the bot!', components: [buttons], ephemeral: true });
    }
}