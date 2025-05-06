const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Manage roles for users, bots, or all members.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(sub =>
            sub.setName('bots')
                .setDescription('Gives or removes a role from all bots')
                .addStringOption(opt =>
                    opt.setName('type')
                        .setDescription('Choose action')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Give', value: 'give' },
                            { name: 'Remove', value: 'remove' }
                        )
                )
                .addRoleOption(opt =>
                    opt.setName('role')
                        .setDescription('Role to modify')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('user')
                .setDescription('Gives or removes a role from a user')
                .addUserOption(opt =>
                    opt.setName('user')
                        .setDescription('User to modify')
                        .setRequired(true)
                )
                .addRoleOption(opt =>
                    opt.setName('role')
                        .setDescription('Role to modify')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('all')
                .setDescription('Gives or removes a role from all members')
                .addStringOption(opt =>
                    opt.setName('type')
                        .setDescription('Choose action')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Give', value: 'give' },
                            { name: 'Remove', value: 'remove' }
                        )
                )
                .addRoleOption(opt =>
                    opt.setName('role')
                        .setDescription('Role to modify')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const role = interaction.options.getRole('role');

        if (subcommand === 'user') {
            const user = interaction.options.getMember('user');
            const botRole = interaction.guild.members.me.roles.highest.position;
            const targetRole = user.roles.highest.position;
            const authorRole = interaction.member.roles.highest.position;

            if (authorRole <= targetRole || botRole <= targetRole) {
                const embed = new EmbedBuilder()
                    .setTitle("⚠️ Cannot modify this member's roles")
                    .setDescription("Their highest role is higher than yours or mine.")
                    .setColor('#ff0000');
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const hasRole = user.roles.cache.has(role.id);
            if (hasRole) {
                await user.roles.remove(role, `By: ${interaction.user.tag}`);
                return interaction.reply({ content: `:white_check_mark: Removed role **${role.name}** from ${user}` });
            } else {
                await user.roles.add(role, `By: ${interaction.user.tag}`);
                return interaction.reply({ content: `:white_check_mark: Added role **${role.name}** to ${user}` });
            }
        }

        if (subcommand === 'bots') {
            const type = interaction.options.getString('type');
            const bots = (await interaction.guild.members.fetch()).filter(member => member.user.bot);

            for (const bot of bots.values()) {
                if (type === 'give') {
                    await bot.roles.add(role, `By: ${interaction.user.tag}`);
                } else {
                    await bot.roles.remove(role, `By: ${interaction.user.tag}`);
                }
            }

            return interaction.reply({
                content: `:white_check_mark: ${type === 'give' ? 'Added' : 'Removed'} role **${role.name}** for **${bots.size}** bots.`
            });
        }

        if (subcommand === 'all') {
            const type = interaction.options.getString('type');
            const members = await interaction.guild.members.fetch();

            for (const member of members.values()) {
                if (type === 'give') {
                    await member.roles.add(role, `By: ${interaction.user.tag}`);
                } else {
                    await member.roles.remove(role, `By: ${interaction.user.tag}`);
                }
            }

            return interaction.reply({
                content: `:white_check_mark: ${type === 'give' ? 'Added' : 'Removed'} role **${role.name}** for **${members.size}** members.`
            });
        }
    }
};
