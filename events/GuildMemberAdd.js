const { WelcomeLeave } = require("canvafy");
const welcomeSchema = require('../Schemas/welcomeSchema');

module.exports = {
  name: "guildMemberAdd",

  async execute(member, client) {
    const data = await welcomeSchema.findOne({
      guildid: member.guild.id,
    });

    if (!data) return;

    const welcomeImage = await new WelcomeLeave()
      .setAvatar(member.user.displayAvatarURL({ forceStatic: true, extension: "png" }))
      .setBackground("image", data.imageURL || "")
      .setTitle("Welcome")
      .setDescription("Welcome to this server, go read the rules please!")
      .setOverlayOpacity(0.3)
      .build();

    member.guild.channels.cache.get(data.channel).send({
      content: data.message
        .replace(/\{mention\}/g, member.user.toString())
        .replace(/\{user\}/g, member.user.username)
        .replace(/\{server\}/g, member.guild.name)
        .replace(/\{members\}/g, member.guild.memberCount),
      files: [{
        attachment: welcomeImage,
        name: `welcome-${member.id}.png`,
      }],
    });
  },
};