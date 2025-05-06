const { SlashCommandBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Create a giveaway')
        .addStringOption(option => 
            option.setName('duration')
                .setDescription('Duration of the giveaway (1h, 1d, etc)')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('winners')
                .setDescription('Number of winners')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('prize')
                .setDescription('What is the prize')
                .setRequired(true)),
    async execute(interaction) {
        const duration = ms(interaction.options.getString('duration'));
        const winnerCount = interaction.options.getInteger('winners');
        const prize = interaction.options.getString('prize');

        if (!duration) {
            return interaction.reply({
                content: 'Please provide a valid duration!',
                ephemeral: true
            });
        }

        await interaction.client.giveawaysManager.start(interaction.channel, {
            duration: duration,
            winnerCount,
            prize,
            hostedBy: interaction.user,
            messages: {
                giveaway: "<a:blue_giveaway:1362526360123474101>  **GIVEAWAY** <a:blue_giveaway:1362526360123474101> ",
                giveawayEnded: "<a:blue_giveaway:1362526360123474101>  **GIVEAWAY ENDED** <a:blue_giveaway:1362526360123474101> ",
                timeRemaining: "Time remaining: **{duration}**!",
                inviteToParticipate: "React with <a:blue_giveaway:1362526360123474101>  to participate!",
                winMessage: "Congratulations, {winners}! You won **{this.prize}**!",
                embedFooter: "Giveaways",
                noWinner: "Giveaway cancelled, no valid participations.",
                hostedBy: "Hosted by: {this.hostedBy}",
                winners: "winner(s)",
                endedAt: "Ended at",
                units: {
                    seconds: "seconds",
                    minutes: "minutes",
                    hours: "hours",
                    days: "days",
                    pluralS: false
                }
            }
        });

        interaction.reply({ content: 'Giveaway started!', ephemeral: true });
    },
};
