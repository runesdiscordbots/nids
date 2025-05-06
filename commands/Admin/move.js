const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Move user from channel to another channel')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to move to another channel')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to move the user to')
                .addChannelTypes(ChannelType.GuildVoice) // Only allow voice channels
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
        .setDMPermission(false),
    category: 'mod',
    async execute(interaction) {
        const member = interaction.options.getMember('user');
        const channel = interaction.options.getChannel('channel');
        
        if (!member.voice.channel) {
            return interaction.reply({ 
                content: `❌ Member must be in a voice channel`,
                ephemeral: true 
            });
        }
        
        if (interaction.user.id === member.user.id) {
            return interaction.reply({ 
                content: `:white_check_mark: **${member.user.username} is already in the voice channel!**`,
                ephemeral: true
            });
        }
        
        try {
            if (!channel) {
                if (!interaction.member.voice.channel) {
                    return interaction.reply({
                        content: `❌ You must be in a voice channel to use this command without specifying a channel`,
                        ephemeral: true
                    });
                }
                
                await member.voice.setChannel(interaction.member.voice.channel, `Moved by: ${interaction.user.tag}`);
                return interaction.reply({
                    content: `:white_check_mark: **${member.user.username} moved to ${interaction.member.voice.channel.name}**`
                });
            }
            
            await member.voice.setChannel(channel, `Moved by: ${interaction.user.tag}`);
            return interaction.reply({ 
                content: `:white_check_mark: **${member.user.username} moved to ${channel.name}**` 
            });
            
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: `❌ Failed to move user - check permissions and try again`,
                ephemeral: true
            });
        }
    },
};