export default async function createCommands(readyClient) {
    const guildId = "1189230282398777374"
    // const guildId = "1187170519301230612"
    const guild = readyClient.guilds.cache.get(guildId);
    let data = {
        name: 'leaderboarding',
        description: 'Post the social credit leaderboard to a specific channel',
        options: [{
            name: 'channel',
            type: 7,
            description: 'The channel to post the leaderboard',
            required: true,
        }],
    };

    // await readyClient.application.commands.create(data); // Global commands
    let command = await guild?.commands.create(data);
    console.log(`Registered command: ${command?.name}`);

    data = {
        name: "stats",
        description: "Get your social credit stats",
    }
    command = await guild?.commands.create(data);
    console.log(`Registered command: ${command?.name}`);

    data = {
        name: "panopticon",
        description: "I can see everyone's social credit scores :3",
        options: [{
            name: "user",
            type: 6,
            description: "The user to check the score of",
            required: true
        }]
    }
    command = await guild?.commands.create(data);
    console.log(`Registered command: ${command?.name}`);
}