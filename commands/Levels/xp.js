const { SlashCommandBuilder, Collection } = require('discord.js');
const db = require('../../Schemas/manager');

const cooldowns = new Collection();
const COOLDOWN_DURATION = 16; // 16 seconds cooldown

module.exports = {
    data: new SlashCommandBuilder()
    .setName('xp')
				.setDescription('Fetch the current xp points an user have')
				.addUserOption(option => option.setName('target').setDescription('The user')
					.setRequired(false))
				.setDMPermission(false),

    async execute(interaction) {
        const userId = interaction.user.id;
        const now = Date.now();
        const cooldownEnd = cooldowns.get(userId);

        if (cooldownEnd && now < cooldownEnd) {
            const remainingTime = Math.ceil((cooldownEnd - now) / 1000);
            return interaction.reply({ 
                content: `${interaction.user.username}, Cool down (${remainingTime} seconds left)`,
                ephemeral: true 
            });
        }

        cooldowns.set(userId, now + (COOLDOWN_DURATION * 1000));

        const member = interaction.options.getUser('target') || interaction.user;
        
        if (member.bot) {
            return interaction.reply(`:thinking: ${member.username} **is a bot and does not earn XP points.**`);
        }

        const { user } = await db.getUserById(member.id);
        interaction.reply(`${member.username} has earned **${user.xp.toLocaleString()}** xp points.`);
    }
}