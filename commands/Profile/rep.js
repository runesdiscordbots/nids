const { SlashCommandBuilder, Collection } = require('discord.js');
const ms = require('ms');
const db = require('../../Schemas/manager');

const cooldowns = new Collection();
const COOLDOWN_DURATION = 16; // 16 seconds cooldown

module.exports = {
    data: new SlashCommandBuilder()
    .setName('rep')
				.setDescription('Give a reputation point to a user')
				.addUserOption(option => option.setName('target').setDescription('The user')
					.setRequired(true))
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

		const member = interaction.options.getUser('target');

		const timeout = 86400000;
		const amount = 1;

		const { user } = await db.getUserById(interaction.user.id);

		const { user: receiver } = await db.getUserById(member.id);
		const { user: sender } = await db.getUserById(interaction.user.id);

		if (receiver.userId === sender.userId) {
			return interaction.reply('You cannot give yourself an extra reputation point.');
		}

		if (user.reputation_cooldown !== null && timeout - (Date.now() - user.reputation_cooldown) > 0) {
			const time = ms(timeout - (Date.now() - user.reputation_cooldown), {
				long: true,
			});

			interaction.reply(`You've already used the rep command recently, \`${time}\` remaining.`);
		}
		else {
			
			db.updateUserById(member.id, {
				reputation: receiver.reputation + amount,
			});

			db.updateUserById(interaction.user.id, {
				reputation_cooldown: Date.now(),
			});

			interaction.reply(`:white_check_mark: You gave a reputation point to ${member.username}!`);
		}
                }
}