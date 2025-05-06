const { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to ban')
                .setRequired(true)
        ),
    timeout: 3000,
    category: 'mod',
    async execute(interaction, client) {
        const member = interaction.options.getMember('user');
        
        // Permission checks
        if (member.id === interaction.user.id) {
            return interaction.reply({ content: `❌ You can't ban yourself!`, ephemeral: true });
        }
        if (member.id === client.user.id) {
            return interaction.reply({ content: `❌ You can't ban me!`, ephemeral: true });
        }
        if (!member.bannable) {
            return interaction.reply({ content: "I can't ban this user", ephemeral: true });
        }

        const botRole = interaction.guild.members.me.roles.highest.position;
        const role = member.roles.highest.position;
        const authorRole = interaction.member.roles.highest.position;

        if (authorRole <= role) {
            return interaction.reply({ content: `🙄 You can't ban @${member.user.username}`, ephemeral: true });
        }
        if (botRole <= role) {
            return interaction.reply({ content: `🙄 You can't ban @${member.user.username}`, ephemeral: true });
        }

        try {
            // Create select menu for ban reason
            const row = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId('reason')
                        .setPlaceholder('Select a reason')
                        .addOptions([
                            {
                                label: 'Spamming',
                                value: 'spamming',
                            },
                            {
                                label: 'Advertising',
                                value: 'adv',
                            },
                        ]),
                );

            await interaction.reply({ content: '**Select a reason:**', components: [row] });

            const filter = i => i.customId === 'reason' && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'reason') {
                    const reason = i.values[0];
                    await member.ban({ 
                        reason: `By: ${interaction.user.tag} | Reason: ${reason}`,
                        deleteMessageDays: 7 
                    });
                    await i.update({ content: `:white_check_mark: **${member.user.tag} has been banned**`, components: [] });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'Ban cancelled - no reason selected', components: [] });
                }
            });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Please check my permissions and role position', ephemeral: true });
        }
    },
};