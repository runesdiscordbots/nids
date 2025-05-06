const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moveme')
        .setDescription('Moves you to another voice channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to move to')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildVoice)
        ),
    timeout: 5000,
    category: 'general',
    /**
     * @param {import('discord.js').CommandInteraction} interaction
     */
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: ':x: You need to be in voice channel', ephemeral: true });
        }
        if (interaction.member.voice.channel.id === channel.id) {
            return interaction.reply({ content: `:x: You are already in ${channel.name} channel`, ephemeral: true });
        }
        await interaction.member.voice.setChannel(channel, `By Moveme command`);
        interaction.reply({ content: `✅ **Moved to ${channel.name} **` });
    },
};