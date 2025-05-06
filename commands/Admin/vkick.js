const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vkick')
        .setDescription('Kick a member from voice channel')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to kick from voice')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
    category: 'mod',
    async execute(interaction) {
        const member = interaction.options.getMember('user');
        if (!member.voice.channel) {
            return interaction.reply({ content: ':x: Member not in voice channel', ephemeral: true });
        }
        await member.voice.disconnect(`By: ${interaction.user.tag}`);
        await interaction.reply(`✅ **@${member.user.username} has been kicked from voice channel**`);
    },
};