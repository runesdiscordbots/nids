const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription(`Test the bot's response time`),
    category: 'general',
    async execute(interaction, client) {
        try {
            const sent = await interaction.reply({ 
                content: 'pong! 🔍',
                fetchReply: true 
            });

            const latency = sent.createdTimestamp - interaction.createdTimestamp;
            const wsping = client?.ws?.ping ? Math.round(client.ws.ping) : 'N/A';

            const embed = new EmbedBuilder()
                .setColor('#1b1432')
                .setDescription(`⏱ Time: ${latency} ms\n⚡ Micro: ${latency} ms\n🌐 WS: ${wsping}${typeof wsping === 'number' ? ' ms' : ''}`)
                .setFooter({ text: `C1S11 • Today at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` })

            await interaction.editReply({
                content: null,
                embeds: [embed]
            });
        } catch (error) {
            console.error('Error in ping command:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: 'There was an error executing this command!',
                    ephemeral: true
                });
            }
        }
    },
};