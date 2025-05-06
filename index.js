const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, Collection, Events, Partials } = require(`discord.js`);
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const { REST } = require('@discordjs/rest');
const url = require('url');
const session = require('express-session');
const bodyParser = require('body-parser');
const { error } = require('console');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const { GiveawaysManager } = require('discord-giveaways');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.GuildMember,
        Partials.Channel,
        Partials.GuildScheduledEvent,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.User
    ]
});

client.commands = new Collection();



// Load commands, events, and prefixes
const functions = fs.readdirSync('./functions').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const commandFolders = fs.readdirSync('./commands');

(async () => {
    for (const file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, './events');
    client.handleCommands(commandFolders, './commands');
    client.login(process.env.token);
})();

// Add this before client.login
client.giveawaysManager = new GiveawaysManager(client, {
    storage: path.join(__dirname, 'data', 'giveaways.json'),
    default: {
        botsCanWin: false,
        embedColor: '#FF0000',
        embedColorEnd: '#000000',
        reaction: '🎉'
    }
});