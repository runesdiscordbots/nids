const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Allows @everyone from sending messages in specific channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to unlock (defaults to current channel)')
                .addChannelTypes(ChannelType.GuildText) // Only allow text channels
                .setRequired(false)
        ),
    timeout: 3000,
    category: 'mod',
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        
        // Check if bot has permissions
        if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
                content: `❌ I don't have permission to manage this channel!`,
                ephemeral: true
            });
        }

        try {
            const everyonePerms = channel.permissionOverwrites.cache.get(interaction.guild.id);
            
            // Check if already unlocked
            if (!everyonePerms?.deny.has(PermissionFlagsBits.SendMessages)) {
                return interaction.reply({
                    content: `🔓 #${channel.name} is already unlocked!`,
                    ephemeral: true
                });
            }

            // Unlock the channel by removing the SendMessages deny
            await channel.permissionOverwrites.edit(interaction.guild.id, {
                SendMessages: null
            }, {
                reason: `Channel unlocked by ${interaction.user.tag}`
            });

            // Send confirmation
            await interaction.reply({
                content: `🔓 Successfully unlocked ${channel}\n**Unlocked by:** ${interaction.user}`,
            });

            // Optional: Send a message in the unlocked channel
            await channel.send({
                content: `🔓 This channel has been unlocked by ${interaction.user}`,
            });

        } catch (error) {
            console.error('Unlock Error:', error);
            return interaction.reply({
                content: `❌ Failed to unlock channel: ${error.message}`,
                ephemeral: true
            });
        }
    },
};