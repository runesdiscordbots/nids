const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a member from text channels so they cannot type')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for mute')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),
    timeout: 3000,
    category: 'mod',
    async execute(interaction) {
        const member = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const { guild, member: author } = interaction;

        // Check if user is trying to mute themselves
        if (author.id === member.id) {
            return interaction.reply({ 
                content: `❌ You can't mute yourself`,
                ephemeral: true 
            });
        }

        // Check role hierarchy
        if (!member.moderatable) {
            const embed = new EmbedBuilder()
                .setDescription(`❌ I can't mute this member because their highest role is higher than or equal to mine!`)
                .setColor('#ff0000');
            return interaction.reply({ 
                embeds: [embed],
                ephemeral: true 
            });
        }

        try {
            // Find or create muted role
            let muteRole = guild.roles.cache.find(r => r.name === 'Muted');
            
            if (!muteRole) {
                muteRole = await guild.roles.create({
                    name: 'Muted',
                    color: '#000000',
                    reason: 'Created for mute command functionality',
                    permissions: []
                });

                // Apply permission overwrites to all channels
                const channels = guild.channels.cache.filter(c => c.isTextBased());
                for (const [_, channel] of channels) {
                    await channel.permissionOverwrites.create(muteRole, {
                        SendMessages: false,
                        AddReactions: false,
                        Speak: false
                    });
                }
            }

            // Check if user is already muted
            if (member.roles.cache.has(muteRole.id)) {
                return interaction.reply({ 
                    content: `❌ This user is already muted `,
                    ephemeral: true 
                });
            }

            // Mute the user
            await member.roles.add(muteRole, `Muted by ${author.user.tag} | Reason: ${reason}`);
            
            // Success response
            const successEmbed = new EmbedBuilder()
                .setDescription(`:white_check_mark: **${member.user.username} has been muted!**\n**Reason:** ${reason}`)
                .setColor('#00ff00');
            
            return interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Mute command error:', error);
            const errorEmbed = new EmbedBuilder()
                .setDescription(`❌ There was an error muting this user. Please check my permissions and role hierarchy!`)
                .setColor('#ff0000');
            return interaction.reply({ 
                embeds: [errorEmbed],
                ephemeral: true 
            });
        }
    },
};