const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } = require('discord.js');

const cooldowns = new Collection();
const COOLDOWN_DURATION = 16; // 16 seconds cooldown

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription(`Displays your banner or someone else's banner`)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get the banner for')
                .setRequired(false)
        ),
    timeout: 3000,
    category: 'general',
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

        await interaction.deferReply(); // Defer reply to avoid timeout
        
        const userOption = interaction.options.getUser('user');
        const targetUser = userOption || interaction.user;

        try {
            // Fetch the user with force to get banner data
            const fetchedUser = await targetUser.fetch({ force: true });
            
            if (!fetchedUser.bannerURL()) {
                return interaction.editReply({
                    content: `❌ ${fetchedUser.tag} doesn't have a banner!`,
                    ephemeral: true
                });
            }

            // Create embed
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: fetchedUser.tag,
                    iconURL: fetchedUser.displayAvatarURL({ dynamic: true, size: 1024 })
                })
                .setImage(fetchedUser.bannerURL({ 
                    dynamic: true, 
                    size: 4096, 
                    format: 'png'
                }))
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 1024 })
                })
                .setColor('#1b1432');

            // Create button
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setURL(fetchedUser.bannerURL({ 
                            dynamic: true, 
                            size: 4096, 
                            format: 'png'
                        }))
                        .setLabel('View Banner in Browser')
                );

            await interaction.editReply({ 
                embeds: [embed], 
                components: [row] 
            });

        } catch (error) {
            console.error('Banner Command Error:', error);
            await interaction.editReply({
                content: `❌ An error occurred while fetching the user banner`,
                ephemeral: true
            });
        }
    },
};