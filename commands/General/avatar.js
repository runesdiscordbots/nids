const {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    Client,
    Collection,
} = require("discord.js");

const cooldowns = new Collection();
const COOLDOWN_DURATION = 16; // 16 seconds cooldown

module.exports = {
    data: new SlashCommandBuilder()
      .setName("avatar")
      .setDescription(`Displays your avatar or someone else's avatar`)
      .addUserOption((o) =>
        o.setName("user").setDescription("User to fetch avatar from")
      ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     * @returns
     */
    async execute(interaction, client) {
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

        const user = interaction.options.getUser("user") ?? interaction.user;
        const embed = new EmbedBuilder()
            .setAuthor({ iconURL: user.displayAvatarURL(), name: user.username })
            .setColor('#1b1432')
            .setImage(user.displayAvatarURL({ size: 1024 }));

        await interaction.reply({ embeds: [embed] });
    }
}