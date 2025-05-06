const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rtimeout')
        .setDescription('Remove timeout from a member')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to remove timeout from')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for removing timeout')),

    async execute(interaction) {
        if (!interaction.member.permissions.has('MODERATE_MEMBERS')) {
            return interaction.reply({ content: 'You do not have permission to remove timeouts.', ephemeral: true });
        }

        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        try {
            await target.timeout(null, reason);
            await interaction.reply(`Timeout has been removed from ${target.user.tag}. Reason: ${reason}`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to remove timeout from the member.', ephemeral: true });
        }
    },
};
