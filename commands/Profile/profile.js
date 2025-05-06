const { SlashCommandBuilder, AttachmentBuilder, Collection } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const db = require('../../Schemas/manager');
const calculateUserXp = (xp) => Math.floor(0.1 * Math.sqrt(xp));
const splice = (s) => (s.length > 40 ? `${s.substring(0, 50)}\n...` : s);
const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
};

const cooldowns = new Collection();
const COOLDOWN_DURATION = 16; // 16 seconds cooldown

module.exports = {
    data: new SlashCommandBuilder()
    .setName('profile')
				.setDescription('Fetch the current profile stats an user have')
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

		await interaction.deferReply();

		const member = interaction.options.getUser('target') || interaction.user;

        // Check if target is a bot
        if (member.bot) {
            return interaction.editReply({ 
                content: `:thinking: ${member.username}, bots do not have profile!`,
                ephemeral: false 
            });
        }

        const { user } = await db.getUserById(member.id);
        const level = calculateUserXp(user.xp);
        
        // Calculate XP progress - updated calculation
        const currentXP = user.xp % 348;
        const totalXP = 348;
        
        let type = 'user';
        if (user.userId == process.env.DEVELOPER_ID) type = 'developer';

        const canvas = createCanvas(500, 500);
        const ctx = canvas.getContext('2d');

        // Load and draw geometric pattern background
        const background = await loadImage('././assets/geometric-background.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Create gradient overlay
        const gradient = ctx.createLinearGradient(0, 0, 500, 500);
        gradient.addColorStop(0, 'rgba(43, 16, 85, 0.9)');  // Made semi-transparent
        gradient.addColorStop(1, 'rgba(117, 151, 222, 0.9)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 500, 500);

        // Draw circular gray area - made more visible
        ctx.beginPath();
        ctx.fillStyle = 'rgba(32, 32, 32, 0.8)';
        ctx.arc(120, 250, 160, 0, Math.PI * 2);
        ctx.fill();

        // Profile Info
        ctx.fillStyle = '#FFFFFF';

        // Username at top center - using actual username
        ctx.textAlign = 'center';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(member.username, 250, 40);

        // Add server icon in the middle top
        const serverIcon = await loadImage(interaction.guild.iconURL({ extension: 'png', size: 128 }));
        const iconSize = 60;
        ctx.save();
        ctx.beginPath();
        ctx.arc(250, 80, iconSize/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(serverIcon, 220, 50, iconSize, iconSize);
        ctx.restore();
        
        // Show username as status text
        ctx.textAlign = 'right';
        ctx.font = '20px Arial';
        ctx.fillText(member.username, 470, 40);

        // Stats on left side
        ctx.textAlign = 'left';
        
        // Level
        ctx.font = 'bold 32px Arial';
        ctx.fillText('LVL', 50, 180);
        ctx.font = 'bold 48px Arial';
        ctx.fillText(level, 50, 230);  // Changed from hardcoded '2' to calculated level

        // REP
        ctx.font = 'bold 32px Arial';
        ctx.fillText('REP', 50, 290);
        ctx.font = 'bold 42px Arial';
        ctx.fillText(`+${user.reputation || 0}`, 50, 340);

        // Credits - with formatted number
        ctx.font = 'bold 32px Arial';
        ctx.fillText('COINS', 50, 400);
        ctx.font = 'bold 42px Arial';
        ctx.fillText(formatNumber(user.balance || 0), 50, 450);  // Changed from '0' to user.balance

        // XP Bar with adjusted positioning
        const barWidth = 200;
        const barHeight = 6;
        const barX = 280;
        const barY = 440;
        
        // Background bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth, barHeight, 3);
        ctx.fill();
        
        // Progress bar
        const progress = (currentXP / 348) * barWidth;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(barX, barY, progress, barHeight, 3);
        ctx.fill();

        // XP Text with real values
        ctx.textAlign = 'center';
        ctx.font = '18px Arial';
        ctx.fillText(`${formatNumber(currentXP)} / ${formatNumber(totalXP)}`, barX + barWidth/2, barY - 10);
        ctx.fillText(`TOTAL XP: ${formatNumber(user.xp)}`, barX + barWidth/2, barY + 25);

        // Avatar - adjusted position higher and more left
        const avatarSize = 140;
        const avatarX = 30;  // Moved left from 50 to 30
        const avatarY = 10;  // Moved up from 20 to 10
        
        const avatar = await loadImage(member.displayAvatarURL({ extension: 'png', size: 256 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'profile.png' });
        await interaction.editReply({ files: [attachment] });
                }
}