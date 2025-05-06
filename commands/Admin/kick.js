const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The member to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)
        ),
    timeout: 3000,
    category: 'mod',
    async execute(interaction, client) {
        const member = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        // Permission checks
        if (member.id === interaction.user.id) {
            return interaction.reply({ 
                content: `❌ You can't kick yourself!`, 
                ephemeral: true 
            });
        }
        
        if (member.id === client.user.id) {
            return interaction.reply({ 
                content: `❌ You can't kick me!`, 
                ephemeral: true 
            });
        }

        // Role hierarchy checks
        const botMember = interaction.guild.members.me;
        const botRole = botMember.roles.highest.position;
        const memberRole = member.roles.highest.position;
        const authorRole = interaction.member.roles.highest.position;

        if (authorRole <= memberRole) {
            return interaction.reply({ 
                content: `❌ You can't kick this member because their highest role is equal or higher than yours!`, 
                ephemeral: true 
            });
        }

        if (botRole <= memberRole) {
            return interaction.reply({ 
                content: `❌ I can't kick this member because their highest role is equal or higher than mine!`, 
                ephemeral: true 
            });
        }

        // Execute kick
        try {
            await member.kick(reason);
            
            // Send confirmation
            await interaction.reply({ 
                content: `:white_check_mark: Successfully kicked **${member.user.tag}**\n**Reason:** ${reason}`,
            });
            
            // Optional: Log to mod logs channel
            // await logKick(interaction, member, reason);
            
        } catch (error) {
            console.error('Kick Error:', error);
            
            if (error.code === 50013) {
                return interaction.reply({ 
                    content: `❌ I don't have permission to kick this member!`, 
                    ephemeral: true 
                });
            }
            
            return interaction.reply({ 
                content: `❌ An error occurred while trying to kick: ${error.message}`, 
                ephemeral: true 
            });
        }
    },
};