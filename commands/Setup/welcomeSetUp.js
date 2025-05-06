const { SlashCommandBuilder, PermissionsBitField, Collection } = require('discord.js');
const welcomeSchema = require(`../../Schemas/welcomeSchema`);

const cooldowns = new Collection();

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`welcome`)
        .setDescription(`Set up a welcome message`)
        .addSubcommand(subcommand =>
            subcommand
                .setName(`set`)
                .setDescription(`Keywords = {mention}, {user}, {server}, {members}`)
                .addChannelOption(option =>
                    option.setName(`channel`)
                        .setDescription(`The channel to send the welcome message`)
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName(`message`)
                        .setDescription(`The message to send`)
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName(`image`)
                        .setDescription(`The URL of the image (optional)`)
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName(`remove`)
                .setDescription(`Deletes the welcome system`)
        ),

    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: `You Need Administrator To Execute This Command!`, ephemeral: true });

        // Check for cooldown
        const userId = interaction.user.id;
        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId);
            const now = Date.now();
            
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return interaction.reply({ content: `Please wait ${timeLeft.toFixed(1)} more seconds before using this command.`, ephemeral: true });
            }
        }

        // Set cooldown
        cooldowns.set(userId, Date.now() + 16000);

        if (interaction.options.getSubcommand() === `set`) {
            const data = await welcomeSchema.findOne({
                guildid: interaction.guild.id,
            });

            if (data) {
                const channel = interaction.options.getChannel(`channel`);
                const message = interaction.options.getString(`message`);
                const imageURL = interaction.options.getString(`image`) || data.imageURL;

                await welcomeSchema.findOneAndUpdate({
                    guildid: interaction.guild.id,
                    channel: channel.id,
                    message: message,
                    imageURL: imageURL,
                });

                await data.save();

                await interaction.reply({ content: `✅ Welcome message updated to "${message}" in channel ${channel}` });
            }

            if (!data) {
                const channel = interaction.options.getChannel(`channel`);
                const message = interaction.options.getString(`message`);
                const imageURL = interaction.options.getString(`image`) || "";

                const data = await welcomeSchema.create({
                    guildid: interaction.guild.id,
                    channel: channel.id,
                    message: message,
                    imageURL: imageURL,
                });

                await data.save();

                await interaction.reply({ content: `✅ Welcome message set to "${message}" in channel ${channel}` });
            }
        }

        if (interaction.options.getSubcommand() === `remove`) {
            const data = await welcomeSchema.findOne({
                guildid: interaction.guild.id,
            });

            if (!data) {
                await interaction.reply({ content: `No Welcome Message Found!`, ephemeral: true });
            } else {
                await welcomeSchema.findOneAndDelete({
                    guildid: interaction.guild.id,
                });

                await interaction.reply({ content: `✅ Welcome message system has been deleted` });
            }
        }
    }
};