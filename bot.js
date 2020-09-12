const { readdirSync } = require('fs');

const { token, prefix } = require('./config.json');

const { Client, Collection } = require('discord.js');
const client = new Client();

client.commands = new Collection();

const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

const cooldowns = new Collection();

client.once('ready', () => {
    client.user.setActivity(`${prefix}help`, { type: 'WATCHING' });
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.id || message.webhookID) return;

    const args = message.content.slice(prefix.length).trim()
        .split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.args && !args.length) {
        let reply = 'you need to specify something.';

        if (command.usage) {
            reply = `use it like this: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.reply(reply);
    }

    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('that command is unavailable in DMs.');
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 0) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;

            return message.channel.send(`Command on cooldown! ${timeLeft.toFixed(1)} second(s).`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error('Error executing command:', error);
        message.reply(`an error occurred during execution of that command! ${error}`);
    }
});

client.login(token);