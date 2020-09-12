const { prefix } = require('../config.json');

module.exports = {
    name: 'help',
    description: 'List all commands or information about a specific one',
    aliases: ['commands', 'list'],
    usage: '[command]',
    execute(message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push('Here are all commands:');
            data.push(commands.map(command => command.name).join(', '));
            data.push(`\nUse \`${prefix}help [command]\` to get information about a command.`);

            return message.channel.send(data, { split: true });
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that command doesn\'t exist.');
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** \`${prefix}${command.name} ${command.usage}\``);

        data.push(`**Cooldown:** ${command.cooldown || 0} second(s)`);

        message.channel.send(data, { split: true });
    },
};