const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows a list of available commands'),

    async execute(interaction) {
        const commandList = [
            '**VoryxBot Support** prefix is `/`',
            'Commands list at https://voryxbot.xyz/commands',
            'Dashboard at https://voryxbot.xyz/',
            'Looking for support? https://discord.gg/RnvuhaZvu7'
            // Add more commands here as your bot grows
        ].join('\n');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Add to your server')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/oauth2/authorize?client_id=1321940665667551272'),
                new ButtonBuilder()
                    .setLabel('VoryxBot Dashboard')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://voryxbot.xyz/')
            );

        await interaction.reply({
            content: commandList,
            components: [row],
            ephemeral: true
        });
    }
};
