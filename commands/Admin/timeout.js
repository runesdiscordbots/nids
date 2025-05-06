const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a member')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to timeout')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Timeout duration (e.g., 1h, 1d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for timeout')),

    async execute(interaction) {
        if (!interaction.member.permissions.has('MODERATE_MEMBERS')) {
            return interaction.reply({ content: 'You do not have permission to timeout members.', ephemeral: true });
        }

        const target = interaction.options.getMember('target');
        const duration = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        // Parse duration
        const durationRegex = /^(\d+)([hdm])$/;
        const match = duration.match(durationRegex);
        
        if (!match) {
            return interaction.reply({ content: 'Invalid duration format. Use formats like: 1h, 2d, 30m', ephemeral: true });
        }

        const [, time, unit] = match;
        const ms = {
            m: 60000,
            h: 3600000,
            d: 86400000
        }[unit] * parseInt(time);

        try {
            await target.timeout(ms, reason);
            await interaction.reply(`${target.user.tag} has been timed out for ${duration}. Reason: ${reason}`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to timeout the member.', ephemeral: true });
        }
    },
};
