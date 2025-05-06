const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Cleans messages from a channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('The number of messages to delete')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(1000)
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to clear messages for')
                .setRequired(false)
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Clear messages from role')
                .setRequired(false)
        ),
    timeout: 5000,
    category: 'mod',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const deleteAmount = interaction.options.getInteger('count');
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');

        try {
            let totalDeleted = 0;
            let remainingMessages = deleteAmount;

            while (remainingMessages > 0) {
                const batchSize = Math.min(remainingMessages, 100);
                const fetchedMessages = await interaction.channel.messages.fetch({ limit: batchSize });
                let messagesToDelete = fetchedMessages;

                if (user) {
                    messagesToDelete = messagesToDelete.filter(msg => msg.author.id === user.id);
                }

                if (role) {
                    messagesToDelete = messagesToDelete.filter(msg => 
                        msg.member?.roles.cache.has(role.id)
                    );
                }

                if (messagesToDelete.size === 0) break;

                if (messagesToDelete.size === 1) {
                    await messagesToDelete.first().delete();
                } else {
                    await interaction.channel.bulkDelete(messagesToDelete, true);
                }

                totalDeleted += messagesToDelete.size;
                remainingMessages -= batchSize;

                // If we got fewer messages than requested, we've reached the end
                if (fetchedMessages.size < batchSize) break;
            }

            if (totalDeleted === 0) {
                return interaction.editReply({
                    content: `❌ No messages found matching your criteria`
                });
            }

            await interaction.editReply({
                content: `**:white_check_mark: Successfully deleted ${totalDeleted} messages**`
            });

        } catch (error) {
            console.error('Clear Error:', error);
            await interaction.editReply({
                content: `❌ Failed to delete messages: ${error.message}`
            });
        }
    },
};