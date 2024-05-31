import { client } from "./index.js"
import { EmbedBuilder } from "discord.js";
import { leaderboardMessages, userSocialStats } from "./database.js";

client.on('interactionCreate', async interaction => {
    try {
        if (!interaction.isCommand()) return;
        // Fetch all global commands
        const commands = await client.application.commands.fetch();
        // Delete all commands
        for (const command of commands.values()) {
            try {
                await client.application.commands.delete(command.id);
            } catch (error) {
                if (error.code === 10063) {
                    console.error(`Tried to delete an unknown command: ${command.id}`);
                } else {
                    throw error;
                }
            }
        }
        let ranks = []
        const { commandName } = interaction;
        if (commandName === 'leaderboard') {
            const channel = interaction.options.getChannel('channel');
            const guildId = interaction.guild.id;
            const generalStats = await userSocialStats.findAll({ where: { guildId: guildId } })
            generalStats.forEach(stat => {
                const name = stat.dataValues.username
                const socialCreditScore = stat.dataValues.socialCreditScore
                ranks.push({ name: name, socialCreditScore: socialCreditScore })
            });
            function compareByCount(a, b) {
                return a.socialCreditScore - b.socialCreditScore;
            }
            ranks.sort(compareByCount);
            const embed = new EmbedBuilder()
                .setTitle('Leaderboard')
                .setDescription('This is the leaderboard');
            console.log(ranks, "ranks")

            embed.addFields({
                name: 'User',
                value: ranks.length > 0 ? ranks.map(rank => rank.name).join("\n") : 'No data',
                inline: true
            })
            embed.addFields({
                name: 'Social Credit Score',
                value: ranks.length > 0 ? ranks.map(rank => rank.socialCreditScore?.toString()).join("\n") : 'No data',
                inline: true
            })

            const leaderboardMessage = await channel.send({ embeds: [embed] });
            await leaderboardMessages.upsert({ guildId: guildId, messageId: leaderboardMessage.id, channelId: channel.id });
            await interaction.reply({ content: 'Posted the leaderboard!', ephemeral: true });
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});