const { SlashCommandBuilder } = require('discord.js');
const db = require('../../Schemas/manager');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Get your daily bonus worth of bits')
    .setDMPermission(false),

    async execute(interaction) {

		const { user } = await db.getUserById(interaction.user.id);

		const timeout = 54000000;

		const amount = Math.floor(Math.random() * 400) + 1;

		if (user.daily_cooldown !== null && timeout - (Date.now() - user.daily_cooldown) > 0) {

			const time = ms(timeout - (Date.now() - user.daily_cooldown), {
				long: true,
			});

			await interaction.reply({ content: `You've already collected your daily reward recently, \`${time}\` remaining.`, ephemeral: true });
		}
		else {
			db.updateUserById(interaction.user.id, {
				daily_cooldown: Date.now(),
				balance: user.balance + amount,
			});

			interaction.reply(`You are eligible for your daily **${amount.toLocaleString()}** <:bits_org:1365729982428610621> Bits`);
		}
    }
}