const BaseCommand = require('../baseCommand');
const packageJson = require('../../../package.json');

class InfoCommand extends BaseCommand {
	constructor (client) {
		super(client);
		this.description = 'Get information about the bot, and some important links.';
		this.aliases = ['invite', 'support'];
		this.group = 'Misc';
		this.guildOnly = false;
	}
	async execute (msg, a, prefix) {
		let upTime = Math.round(this.client.uptime / 60000);
		let suffix = "Minutes";
		if (upTime > 60) {
			// It's > hr
			upTime = upTime / 60;
			upTime = Math.round(upTime * 10) / 10;
			suffix = "Hours";
		} else if (upTime > 1440) {
			upTime = upTime / 1440;
			upTime = Math.round(upTime * 10) / 10;
			suffix = "Days";
		}
		const links = await this.client.db.users.count();
		msg.channel.sendInfo(msg.author,
			{
				title: 'Bot information',
				description: `**BloxCord** is a Roblox verification bot created by \`BloxCord\`. The bot is always undergoing improvement. \nCurrent version: ${packageJson.version}\nBloxCord is a source.`,
				timestamp: new Date(),
				fields: [
					{name: 'Bot info', value: `BloxCord was created by Filip. It is written in Node.js, and recently became a Public source. If you wish to view the bot commands, please do \`${prefix}help\`.`},
					{name: 'Our website', value: 'BloxCord now has a website, with our terms of use and commands. By using the bot, you agree to our [terms of use](https://BloxCord.online/terms). You can see our site [here](https://BloxCord.online.).'},
					{name: 'Github', value: 'You can snoop, fork, edit and contribute to the source code here:\n - [Bot](https://github.com/Coming Soon)\n - [Website](https://github.com/Coming Soon)'},
					{name: 'Discord invite', value: 'For support, join our [discord](https://discord.gg/). This is also where you can make suggestions.'},
					{name: 'Bot invite', value: 'To invite the bot to your server, use [this](https://discordapp.com/) link.'},
					{name: 'Donate', value: 'Do you enjoy using BloxCord? Please donate to the running of the bot [here](https://www.paypal.me/).'},
					{name: 'Discord bot list', value: 'Why not check us out on [Discord bot list](https://discordbots.org/bot/)? You can also vote for BloxCord, but we don\'t mind!'},
					{name: 'Servers', value: this.client.guilds.size, inline: true},
					{name: 'Uptime', value: `${upTime} ${suffix}`, inline: true},
					{name: 'Account links', value: links, inline: true}

				]
			});
	}
}
module.exports = InfoCommand;
