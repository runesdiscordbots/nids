const { SlashCommandBuilder, Collection } = require('discord.js');
const db = require('../../Schemas/manager');

const cooldowns = new Collection();
const COOLDOWN_DURATION = 16; // 16 seconds cooldown

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coins')
        .setDescription('Check balance or transfer bits')
        .addUserOption(option => 
            option.setName('target')
            .setDescription('The user to check balance or transfer bits to')
            .setRequired(false))
        .addNumberOption(option =>
            option.setName('amount')
            .setDescription('Amount of bits to transfer (min: 1 max: 9999999)')
            .setMinValue(1)
            .setMaxValue(9999999)
            .setRequired(false))
        .addStringOption(option =>
            option.setName('comment')
            .setDescription('Add a comment to your transfer')
            .setRequired(false)
            .setMaxLength(100))
        .setDMPermission(false),

    async execute(interaction) {
        const member = interaction.options.getUser('target') || interaction.user;

        // Check if target is a bot
        if (member.bot) {
            return interaction.reply({ 
                content: `:thinking: ${member.username}, **bots do not have bits!**`,
                ephemeral: false 
            });
        }

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

        const amount = interaction.options.getNumber('amount');
        const comment = interaction.options.getString('comment');

        // If no amount specified, just check balance
        if (!amount) {
            const { user } = await db.getUserById(member.id);
            return interaction.reply(`:bank: | **${member.username}, your account balance is** \`${user.balance.toLocaleString()}\``);
        }

        // If amount specified, handle transfer
        const fee = Math.round(amount - amount * 0.729);
        const { user: receiver } = await db.getUserById(member.id);
        const { user: sender } = await db.getUserById(interaction.user.id);
        const coinsGiven = amount - fee;

        if (amount > sender.balance) {
            return interaction.reply('Sorry, but you don\'t have that amount of bits.');
        }

        if (receiver.userId === sender.userId) {
            return interaction.reply('You cannot transfer bits to your own account.');
        }

        await db.updateUserById(member.id, {
            balance: receiver.balance + coinsGiven,
        });

        await db.updateUserById(interaction.user.id, {
            balance: sender.balance - amount,
        });

        return interaction.reply(`:white_check_mark: Successfully transfered \`${amount.toLocaleString()}\` bits to ${member.username}. \`fee: ${fee.toLocaleString()} (${Math.round((1 - 0.729) * 100)}%)\`${comment ? `\n📝 Comment: ${comment}` : ''}`);
    }
}