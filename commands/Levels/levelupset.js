const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('levelupset')
        .setDescription('Configure level up notifications')
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Set the channel for level up messages')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to send level up messages')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('message')
                .setDescription('Set custom level up message')
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Use {user} for username and {level} for level')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View current level up settings'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Reset level up settings to default'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const db = require('../../Schemas/manager');

        try {
            switch (subcommand) {
                case 'channel': {
                    const channel = interaction.options.getChannel('channel');
                    const settings = await db.getGuildSettings(interaction.guild.id);
                    settings.levelUpChannel = channel.id;
                    await settings.save();
                    
                    await interaction.reply({
                        content: `Level up messages will now be sent to ${channel}`,
                        ephemeral: true
                    });
                    break;
                }
                case 'message': {
                    const message = interaction.options.getString('message');
                    const settings = await db.getGuildSettings(interaction.guild.id);
                    settings.levelUpMessage = message;
                    await settings.save();

                    await interaction.reply({
                        content: `Level up message set to:\n${message}`,
                        ephemeral: true
                    });
                    break;
                }
                case 'view': {
                    const settings = await db.getGuildSettings(interaction.guild.id);
                    const channel = settings.levelUpChannel 
                        ? `<#${settings.levelUpChannel}>`
                        : 'Same channel as message';

                    await interaction.reply({
                        content: `**Current Settings**\nChannel: ${channel}\nMessage: \`${settings.levelUpMessage}\``,
                        ephemeral: true
                    });
                    break;
                }
                case 'reset': {
                    const settings = await db.getGuildSettings(interaction.guild.id);
                    settings.levelUpChannel = null;
                    settings.levelUpMessage = '🎉 Congratulations {user}, you leveled up to level `{level}`!';
                    await settings.save();

                    await interaction.reply({
                        content: 'Level up settings have been reset to default',
                        ephemeral: true
                    });
                    break;
                }
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    },
};
