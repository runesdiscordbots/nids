const { SlashCommandBuilder, EmbedBuilder, ChannelType, Collection } = require('discord.js');

const cooldowns = new Collection();
const COOLDOWN_DURATION = 16; // 16 seconds cooldown

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Displays information about the server'),
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

		const guild = interaction.guild;
		
		// Get text and voice channel counts
		const textChannels = guild.channels.cache.filter(r => r.type === ChannelType.GuildText).size;
		const voiceChannels = guild.channels.cache.filter(r => r.type === ChannelType.GuildVoice).size;
		const roles = guild.roles.cache.size - 1; // Subtract 1 to exclude @everyone role

		// Create the embed
		const embed = new EmbedBuilder()
			.setAuthor({ name: 'lumi.', iconURL: guild.iconURL({ dynamic: true }) })
			.setColor('#1b1432')
			.addFields(
				{
					name: ':id: Server ID:',
					value: guild.id,
					inline: true,
				},
				{
					name: ':calendar: Created On',
					value: `<t:${Math.floor(
						guild.createdTimestamp / 1000
					)}:R>`,
					inline: true,
				},
				{
					name: ':crown: Owned by',
					value: `<@${guild.ownerId}>`,
					inline: true,
				},
				{
					name: ':busts_in_silhouette: Members',
					value: `${guild.memberCount} Online\n${guild.premiumSubscriptionCount} Boosts ✨`,
					inline: true,
				},
				{
					name: ':speech_balloon: Channels',
					value: `${textChannels} Text | ${voiceChannels} Voice`,
					inline: true,
				},
				{
					name: ':earth_africa: Others',
					value: `Verification Level: ${guild.verificationLevel}\nRoles: ${roles}`,
					inline: true,
				},
				{
					name: ':closed_lock_with_key: Roles',
					value: `Roles: ${roles}`,
					inline: true,
				}
			)
			.setThumbnail(guild.iconURL({ dynamic: true }));

		await interaction.reply({ embeds: [embed] });
	},
};