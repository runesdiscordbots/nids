const { loadImage, createCanvas } = require('canvas');
const { AttachmentBuilder, SlashCommandBuilder, Collection } = require('discord.js');
const path = require('path');
const db = require('../../Schemas/manager');
const userModel = require('../../Schemas/userModel');
const calculateUserXp = (xp) => Math.floor(0.1 * Math.sqrt(xp));

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

const cooldowns = new Collection();
const COOLDOWN_DURATION = 16; // 16 seconds cooldown

module.exports = {
    data: new SlashCommandBuilder()
    .setName('rank')
				.setDescription('Get your current level')
				.addUserOption(option => option.setName('target').setDescription('The user')
					.setRequired(false))
				.setDMPermission(false),

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

        const member = interaction.options.getUser('target') || interaction.user;
        const { user } = await db.getUserById(member.id);
        const users = await userModel.find({}).sort('-xp');

		let position = -1;
		for (let i = 0; i < users.length; i++) {
			if (users[i].userId === member.id) {
				position = i + 1;
				break;
			}
		}

		const level = calculateUserXp(user.xp);

		const minXp = (level * level) / 0.01;
		const maxXp = ((level + 1) * (level + 1)) / 0.01;

		const canvas = createCanvas(500, 150);
		const ctx = canvas.getContext('2d');

		// Load and draw background image
		const background = await loadImage(path.join(__dirname, '../../assets/rank2.png'));
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		// Avatar circle with border
		ctx.save();
		ctx.beginPath();
		ctx.arc(55, 55, 40, 0, Math.PI * 2); // Reduced radius and adjusted position
		ctx.strokeStyle = '#9B7DED';
		ctx.lineWidth = 3;
		ctx.stroke();
		ctx.closePath();
		ctx.clip();
		
		const avatar = await loadImage(member.displayAvatarURL({ extension: 'png', size: 128 }));
		ctx.drawImage(avatar, 15, 15, 80, 80); // Reduced size from 90x90 to 80x80
		ctx.restore();

		// Username
		ctx.font = 'bold 25px Arial';
		ctx.fillStyle = '#FFFFFF';
		ctx.fillText(member.username, 100, 50);

		// Level and XP on same line
		ctx.font = '20px Arial';
		ctx.fillStyle = '#9B7DED';
		ctx.textAlign = 'left';
		ctx.fillText(`Level ${level}`, 100, 80);
		
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'right';
		ctx.fillText(`XP: ${formatNumber(user.xp)}/${formatNumber(maxXp)}`, 450, 80);

		// Progress bar (rest remains the same)
		ctx.beginPath();
		ctx.fillStyle = '#FFFFFF';
		roundRect(ctx, 100, 90, 350, 20, 10);
		ctx.fill();

		// Progress bar (teal)
		ctx.beginPath();
		ctx.fillStyle = '#9B7DED';
		const progress = (user.xp - minXp) / (maxXp - minXp);
		roundRect(ctx, 100, 90, 350 * progress, 20, 10);
		ctx.fill();

		const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'rank.png' });
		interaction.reply({ files: [attachment] });
    }
};

// Helper function for rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}