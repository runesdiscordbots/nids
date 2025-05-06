const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a member or all banned members')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option.setName('input')
                .setDescription('User ID or "all" to unban everyone')
                .setRequired(true)
        ),
    timeout: 3000,
    category: 'mod',
    async execute(interaction) {
        const input = interaction.options.getString('input');
        
        if (input === 'all') {
            try {
                const fetchBans = await interaction.guild.bans.fetch();
                if (fetchBans.size === 0) {
                    return interaction.reply({ content: 'There are no banned users.', ephemeral: true });
                }
                
                // Confirm before mass unban
                const confirmRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirm_unban_all')
                            .setLabel('Confirm')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('cancel_unban_all')
                            .setLabel('Cancel')
                            .setStyle(ButtonStyle.Secondary)
                    );

                const response = await interaction.reply({
                    content: `⚠️ Are you sure you want to unban **${fetchBans.size}** members?`,
                    components: [confirmRow],
                    ephemeral: true
                });

                const collector = response.createMessageComponentCollector({ time: 15000 });

                collector.on('collect', async i => {
                    if (i.customId === 'confirm_unban_all') {
                        await i.deferUpdate();
                        const usersBanned = fetchBans.map(ban => ban.user.id);
                        
                        // Unban in batches to avoid rate limits
                        for (const userId of usersBanned) {
                            try {
                                await interaction.guild.bans.remove(userId, `Mass unban by: ${interaction.user.tag}`);
                            } catch (error) {
                                console.error(`Failed to unban ${userId}:`, error);
                            }
                        }
                        
                        await i.editReply({
                            content: `:white_check_mark: **${usersBanned.length}** members have been unbanned`,
                            components: []
                        });
                    } else if (i.customId === 'cancel_unban_all') {
                        await i.update({
                            content: 'Mass unban cancelled',
                            components: []
                        });
                    }
                });

                collector.on('end', collected => {
                    if (collected.size === 0) {
                        interaction.editReply({
                            content: 'Mass unban timed out - no action taken',
                            components: []
                        });
                    }
                });

            } catch (error) {
                console.error(error);
                return interaction.reply({ content: 'An error occurred while fetching bans', ephemeral: true });
            }
            return;
        }

        // Single user unban
        try {
            const user = await interaction.guild.bans.remove(input, `By: ${interaction.user.tag}`);
            await interaction.reply({ content: `:white_check_mark: **@${user.user?.tag || input}** has been unbanned` });
        } catch (error) {
            console.error(error);
            if (error.code === 10026) { // Unknown Ban
                return interaction.reply({ content: 'This user is not banned', ephemeral: true });
            }
            return interaction.reply({ content: `Error: ${error.message}`, ephemeral: true });
        }
    },
};