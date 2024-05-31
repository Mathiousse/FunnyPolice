import 'dotenv/config'
import pkg from 'discord.js';
const { Client, Events, GatewayIntentBits, Partials } = pkg;
import { userSocialStats, messagesScored, leaderboardMessages } from "./database.js";
import { EmbedBuilder } from '@discordjs/builders';

export const reactionList = {
    "😀": -2,
    "😃": -1,
    "😄": 0,
    "😁": 1,
    "🏳️‍⚧️": 2
}

const cutoff = "1717178914308"

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});


client.once('ready', readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
    import("./interactionCreate.js");
});


client.once('ready', async () => {
    const data = {
        name: 'leaderboard',
        description: 'Post the social credit leaderboard to a specific channel',
        options: [{
            name: 'channel',
            type: 7,
            description: 'The channel to post the leaderboard',
            required: true,
        }],
    };

    // await client.application.commands.create(data); // Global commands
    const guildId = '1189230282398777374'; // only for the main discord
    const guild = client.guilds.cache.get(guildId);
    let command = await guild?.commands.create(data);
    // console.log(`Registered command: ${command?.name}`);
    userSocialStats.sync();
    // userSocialStats.sync({ force: true });
    messagesScored.sync()
    // messagesScored.sync({ force: true })
    leaderboardMessages.sync()
    // leaderboardMessages.sync({ force: true })

});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (reaction.message.createdAt < cutoff) return console.log('Message too old')
    console.log(reaction, "reaction")
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            return;
        }
    }
    // Here you get added reactions
    if (reactionList[reaction.emoji.name]) {
        // If self react, add to shame counter
        if (reaction.message.author.id === user.id && reactionList[reaction.emoji.name] > 0) {
            const userStats = await userSocialStats.findOne({ where: { discordid: user.id, guildId: reaction.message.guild.id } });
            if (userStats) {
                await userStats.increment('shameCount', { by: 1 });
            } else {
                await userSocialStats.create({
                    discordid: user.id,
                    guildId: reaction.message.guild.id,
                    username: user.username,
                    shameCount: 1
                });
            }
            // return // add when shame time
        }
        const score = reactionList[reaction.emoji.name];
        const message = await messagesScored.findOne({ where: { messageId: reaction.message.id } });
        if (message) {
            await message.increment('score', { by: score });
        } else {
            await messagesScored.create({
                messageId: reaction.message.id,
                guildId: reaction.message.guild.id,
                scoredBy: user.id,
                score: score
            });
        }
        const messageUser = await client.users.fetch(reaction.message.author.id);
        const userStats = await userSocialStats.findOne({ where: { discordid: messageUser.id, guildId: reaction.message.guild.id } });
        if (userStats) {
            await userStats.increment('socialCreditCount', { by: score });
        } else {
            await userSocialStats.create({
                discordid: messageUser.id,
                guildId: reaction.message.guild.id,
                username: messageUser.username,
                socialCreditCount: score
            });
        }
        embedEditor(reaction, client, leaderboardMessages, userSocialStats)
    }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if (reaction.message.createdAt < cutoff) return console.log('Message too old')
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            return;
        }
    }
    // Here you get removed reactions
    if (reactionList[reaction.emoji.name]) {
        // If self react, remove from shame counter
        if (reaction.message.author.id === user.id) {
            const userStats = await userSocialStats.findOne({ where: { discordid: user.id, guildId: reaction.message.guild.id } });
            if (userStats) {
                await userStats.decrement('shameCount', { by: 1 });
            }
            // return // add when shame time
        }
        const score = reactionList[reaction.emoji.name];
        const message = await messagesScored.findOne({ where: { messageId: reaction.message.id } });
        if (message) {
            await message.decrement('score', { by: score });
        }
        const messageUser = await client.users.fetch(reaction.message.author.id);
        const userStats = await userSocialStats.findOne({ where: { discordid: messageUser.id, guildId: reaction.message.guild.id } });
        if (userStats) {
            await userStats.decrement('socialCreditCount', { by: score });
        }
        embedEditor(reaction, client, leaderboardMessages, userSocialStats)
    }
});

const embedEditor = async (reaction, client, leaderboardMessages, userSocialStats) => {
    const leaderboardMessageRecord = await leaderboardMessages.findOne({ where: { guildId: reaction.message.guild.id } });
    if (!leaderboardMessageRecord) {
        console.log('No leaderboard message found!')
        return;
    }
    console.log('Leaderboard message found!')
    const channel = client.channels.cache.get(leaderboardMessageRecord.channelId);
    let leaderboardMessage
    try {
        leaderboardMessage = await channel.messages.fetch(leaderboardMessageRecord.messageId);
    } catch (error) {
        console.error(`Failed to fetch message: ${error}`);
    }
    let ranks = []
    const generalStats = await userSocialStats.findAll({ where: { guildId: reaction.message.guild.id } })
    generalStats.forEach(stat => {
        const discordid = stat.dataValues.discordid
        const socialCreditCount = stat.dataValues.socialCreditCount
        ranks.push({ discordid: discordid, socialCreditCount: socialCreditCount })
    });
    function compareByCount(a, b) {
        return b.socialCreditCount - a.socialCreditCount;
    }
    ranks.sort(compareByCount);
    const embed = new EmbedBuilder()
        .setTitle('Leaderboard')
        .setDescription('This is the leaderboard');
    embed.addFields(
        {
            name: 'Utilisateur',
            value: ranks.map(rank => "<@" + rank.discordid + ">").join("\n"),
            inline: true
        },
        {
            name: '\u200B',
            value: '\u200B',
            inline: true
        },
        {
            name: 'Social Credit Score',
            value: ranks.map(rank => rank.socialCreditCount.toString()).join("\n"),
            inline: true
        },
    );
    await leaderboardMessage.edit({ embeds: [embed] });
    return
}

client.login(process.env.DISCORD_TOKEN)