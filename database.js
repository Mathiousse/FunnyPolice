import Sequelize from 'sequelize';
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

export const userSocialStats = sequelize.define('userSocialStats', {
    discordid: {
        type: Sequelize.STRING,
    },
    guildId: {
        type: Sequelize.STRING,
    },
    username: {
        type: Sequelize.STRING,
    },
    socialCreditCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    shameCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
});
export const UserReactions = sequelize.define('userReactions', {
    userId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    guildId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    messageId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    channelId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    reactedTo: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    reactionType: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});


export const messagesScored = sequelize.define('messagesScored', {
    messageId: {
        type: Sequelize.STRING,
        unique: true,
    },
    guildId: {
        type: Sequelize.STRING,
    },
    scoredBy: {
        type: Sequelize.STRING,
    },
    score: {
        type: Sequelize.INTEGER,
    },
});


export const leaderboardMessages = sequelize.define('leaderboardMessages', {
    guildId: {
        type: Sequelize.STRING,
        unique: true,
    },
    messageId: {
        type: Sequelize.STRING,
    },
    channelId: {
        type: Sequelize.STRING,
    }
});
