import { client } from "./index.js"
import { EmbedBuilder } from "discord.js";
import { leaderboardMessages, userSocialStats, UserReactions } from "./database.js";

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
        const { commandName } = interaction;
        let messagesReacted, reactedToMe, whoLovesMe, whoILove;
        switch (commandName) {
            case 'leaderboarding':
                await leaderboardCommand(interaction);
                break;
            case 'stats':
                // console.log(interaction.user.id, "interaction")
                messagesReacted = await UserReactions.findAll({ where: { userId: interaction.user.id } });
                reactedToMe = await UserReactions.findAll({ where: { reactedTo: interaction.user.id } });
                whoLovesMe = [], whoILove = []
                messagesReacted.forEach(message => {
                    // Check if the user is already in the array of objects
                    if (!whoILove.some(whoLoves => whoLoves.userid === message.dataValues.reactedTo)) {
                        whoILove.push({ userid: message.dataValues.reactedTo, count: 1 });
                    } else {
                        const user = whoILove.find(whoLoves => whoLoves.userid === message.dataValues.reactedTo);
                        user.count++;
                    }
                })
                reactedToMe.forEach(message => {
                    // Check if the user is already in the array of objects
                    if (!whoLovesMe.some(whoLoves => whoLoves.userid === message.dataValues.userId)) {
                        whoLovesMe.push({ userid: message.dataValues.userId, count: 1 });
                    } else {
                        const user = whoLovesMe.find(whoLoves => whoLoves.userid === message.dataValues.userId);
                        user.count++;
                    }
                })
                // Sort the array of objects by the count
                whoILove.sort((a, b) => b.count - a.count);
                whoLovesMe.sort((a, b) => b.count - a.count);
                const embed = new EmbedBuilder()
                    .setTitle('Stats')
                    .setDescription('Here are your stats :3');
                embed.addFields({
                    name: 'Reacted to',
                    value: ("Total\n\n") + whoILove.map(person => "<@" + person.userid + ">").join("\n ") + "\n\n",
                    inline: true
                })
                embed.addFields({
                    name: "Amount of reactions",
                    value: (messagesReacted.length.toString() + "\n\n") + whoILove.map(person => person.count).join("\n ") + "\n\n",
                    inline: true
                })
                embed.addFields({
                    name: '‎ ‎ ',
                    value: '‎ ‎ ‎ ',
                    inline: true,
                })
                embed.addFields({
                    name: 'Reacted by',
                    value: ("Total\n\n") + whoLovesMe.map(person => "<@" + person.userid + ">").join("\n ") + "\n\n",
                    inline: true
                })
                embed.addFields({
                    name: "Amount of reactions",
                    value: (reactedToMe.length.toString() + "\n\n") + whoLovesMe.map(person => person.count).join("\n ") + "\n\n",
                    inline: true
                })
                embed.addFields({
                    name: '‎ ‎ ',
                    value: '‎ ‎ ‎ ',
                    inline: true,
                })
                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;

            case 'panopticon':
                // console.log(interaction.user.id, "interaction")
                const user = interaction.options.getUser('user');
                messagesReacted = await UserReactions.findAll({ where: { userId: user.id } });
                reactedToMe = await UserReactions.findAll({ where: { reactedTo: user.id } });
                whoLovesMe = [], whoILove = []
                messagesReacted.forEach(message => {
                    // Check if the user is already in the array of objects
                    if (!whoILove.some(whoLoves => whoLoves.userid === message.dataValues.reactedTo)) {
                        whoILove.push({ userid: message.dataValues.reactedTo, count: 1 });
                    } else {
                        const user = whoILove.find(whoLoves => whoLoves.userid === message.dataValues.reactedTo);
                        user.count++;
                    }
                })
                reactedToMe.forEach(message => {
                    // Check if the user is already in the array of objects
                    if (!whoLovesMe.some(whoLoves => whoLoves.userid === message.dataValues.userId)) {
                        whoLovesMe.push({ userid: message.dataValues.userId, count: 1 });
                    } else {
                        const user = whoLovesMe.find(whoLoves => whoLoves.userid === message.dataValues.userId);
                        user.count++;
                    }
                })
                console.log(whoLovesMe, "who loves me")
                console.log(whoILove, "who i love")
                // Sort the array of objects by the count
                whoILove.sort((a, b) => b.count - a.count);
                whoLovesMe.sort((a, b) => b.count - a.count);
                const embed2 = new EmbedBuilder()
                    .setTitle('Stats')
                    .setDescription(`Here are the stats of <@${user.id}> :3`);
                embed2.addFields({
                    name: 'Reacted to',
                    value: ("Total\n\n") + whoILove.map(person => "<@" + person.userid + ">").join("\n ") + "\n\n",
                    inline: true
                })
                embed2.addFields({
                    name: "Amount of reactions",
                    value: (messagesReacted.length.toString() + "\n\n") + whoILove.map(person => person.count).join("\n ") + "\n\n",
                    inline: true
                })
                embed2.addFields({
                    name: '‎ ‎ ',
                    value: '‎ ‎ ‎ ',
                    inline: true,
                })
                embed2.addFields({
                    name: 'Reacted by',
                    value: ("Total\n\n") + whoLovesMe.map(person => "<@" + person.userid + ">").join("\n ") + "\n\n",
                    inline: true
                })
                embed2.addFields({
                    name: "Amount of reactions",
                    value: (reactedToMe.length.toString() + "\n\n") + whoLovesMe.map(person => person.count).join("\n ") + "\n\n",
                    inline: true
                })
                embed2.addFields({
                    name: '‎ ‎ ',
                    value: '‎ ‎ ‎ ',
                    inline: true,
                })
                await interaction.reply({ embeds: [embed2], ephemeral: true });
                break;
            default:
                await interaction.reply({ content: 'Unknown command!', ephemeral: true });
                break;
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});


function compareByCount(a, b) {
    return a.socialCreditScore - b.socialCreditScore;
}


const leaderboardCommand = async function (interaction) {
    let ranks = []
    const channel = interaction.options.getChannel('channel');
    const guildId = interaction.guild.id;
    const generalStats = await userSocialStats.findAll({ where: { guildId: guildId } })
    generalStats.forEach(stat => {
        const discordid = stat.dataValues.discordid
        const socialCreditCount = stat.dataValues.socialCreditCount
        ranks.push({ discordid: discordid, socialCreditCount: socialCreditCount })
    });

    ranks.sort(compareByCount);
    const embed = new EmbedBuilder()
        .setTitle('Leaderboard')
        .setDescription('This is the leaderboard');

    embed.addFields({
        name: 'User',
        value: ranks.length > 0 ? ranks.map(rank => "<@" + rank.discordid + ">").join("\n") : 'No data',
        inline: true
    })
    embed.addFields({
        name: 'Social Credit Score',
        value: ranks.length > 0 ? ranks.map(rank => rank.socialCreditCount?.toString()).join("\n") : 'No data',
        inline: true
    })

    const leaderboardMessage = await channel.send({ embeds: [embed] });
    await leaderboardMessages.upsert({ guildId: guildId, messageId: leaderboardMessage.id, channelId: channel.id });
    await interaction.reply({ content: 'Posted the leaderboard!', ephemeral: true });

}