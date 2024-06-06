export default async function createCommands(readyClient) {
    const guildId = "1189230282398777374"
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
}