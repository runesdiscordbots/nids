const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Shows user information')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Select a user')
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(target.id);

        const embed = new EmbedBuilder()
            .setColor('#2F3136')
            .addFields([
                { name: 'Joined Discord :', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Joined Server :', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }
            ])
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 512 }))
            .setFooter({ 
                text: `${target.tag}`, 
                iconURL: target.displayAvatarURL({ dynamic: true }) 
            });

        await interaction.reply({ embeds: [embed] });
    },
};
