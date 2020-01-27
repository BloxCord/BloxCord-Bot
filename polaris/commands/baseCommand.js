class BaseCommand {
	constructor (client) {
		this.client = client;
		this.name = 'Unidentified command';
		this.description = 'This command does not have a description';
		this.group = 'Misc';
		this.permissions = [];
		this.aliases = [];

		this.guildOnly = true;
		this.hidden = false;
	}

	async process (message, args, prefix) {
		if (this.hidden && message.author.id !== this.client.ownerId) return;
		if (!message.author || message.author.bot) return;
		const blacklist = await this.client.db.blacklist.get(message.author.id);
		if (blacklist) {
			return message.channel.sendError(message.author, {title: 'Blacklisted', description: `You are blacklisted from using BloxCord. This is likely due to a violation of our Terms of service, or some other equally grievous action.\n**Reason: **${blacklist.reason ? blacklist.reason : 'None provided.'}\n**Date: **${blacklist.time}`});
		}

		if (message.channel.guild) {
			const serverBlacklist = await this.client.db.blacklist.get(message.channel.guild.id);
			if (serverBlacklist) {
				await message.channel.sendError(message.author, {title: 'Blacklisted!', description: `This server is blacklisted from using BloxCord. This is likely due to a violation of our Terms of service, or some other equally grievous action.\n**Reason: **${blacklist.reason ? blacklist.reason : 'None provided.'}\n**Date: **${blacklist.time}`, fields: [{name: 'Leaving server', value: 'I am now leaving the server. Please do not re-invite me.'}]});
				message.channel.guild.leave();
				return;
			}

			if (!message.member) {
				await message.channel.guild.fetchAllMembers(9000);
				if (message.channel.guild.members.has(message.author.id)) {
					// eslint-disable-next-line require-atomic-updates
					message.member = message.channel.guild.members.get(message.author.id);
				} else {
					return;
				}
			}
		} else {
			if (this.permissions.length !== 0 || this.guildOnly) return message.channel.sendError(message.author, 'This command **can only be ran in a server!**');
		}

		if (this.client.cooldown.has(message.author.id)) {
			return message.channel.send(':x: - There is a command cooldown of 3 seconds. Please wait!');
		}
		if (message.author.id !== this.client.ownerId) {
			let permissionFails = [];
			this.permissions.forEach(permission => {
				if (!message.member.permission.has(permission)) {
					permissionFails.push(permission);
				}
			});
			if (permissionFails.length !== 0) {
				return message.channel.sendError(message.author, {title: 'Error', description: `The \`${this.name}\` command requires \`${permissionFails.join(', ')}\` permission(s)`});
			}
		}
		if (!message.member && this.guildOnly) {
			console.log('MEMBER IS NULL. Content: ' + message.content + ' id: ' + message.id);
			return message.channel.sendError(message.author, "I couldn't find your guildMember. Please switch to `Online`, `Idle` or `DnD`. If issue persists, join our discord.");
		}

		// ERROR cATCHING
		try {
			let commandName = this.name;
			this.client.Raven.setContext({
				extra: {
					args: args,
					command: commandName
				},
				user: {
					username: message.author.username,
					discriminator: message.author.discriminator,
					ID: message.author.id
				}
			});
			const cooldown = this.client.cooldown;
			cooldown.add(message.author.id);
			setTimeout(() => cooldown.delete(message.author.id), 3000);
			await this.execute(message, args, prefix);
		} catch (e) {
			// this.client.Raven.captureException(e);
			console.log('Command catch: ' + e);
			await message.channel.sendError(message.author, {
				title: 'Oops! An error has occured.',
				description: `BloxCord has encounted an unexpected and fatal error. We're right on it! You may want to join to join our [discord](https://discord.gg/) to help with fixing this.\n \`\`\` ${e.message} \`\`\``
			});
			this.client.Raven.captureException(e);
		}
	}
}

module.exports = BaseCommand;