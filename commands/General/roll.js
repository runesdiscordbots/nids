const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: 'fun',
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolling dice')
        .addStringOption(option =>
            option.setName('dice')
                .setDescription('The dice default is 100')
        ),
    async execute(interaction) {
        const number = interaction.options.getString('dice') || 100;
        if (isNaN(number)) {
            return interaction.reply({ content: ':x: Invalid number', ephemeral: true });
        }
        const num = parseInt(number);
        if (num <= 0) {
            return interaction.reply({ content: ':x: Number must be greater than 0', ephemeral: true });
        }
        const getRandomNumber = Math.floor(Math.random() * num) + 1;
        await interaction.reply(getRandomNumber.toString());
    },
};