const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ]
});
const fs = require('fs');
const config = require('./config.json');

if (!fs.existsSync("storaged")) {
    fs.mkdirSync("storaged");
}

if (!fs.existsSync("storaged/votes.json")) {
    fs.writeFileSync("storaged/votes.json", JSON.stringify([]));
}

const commandsList = global.commandsList = new Collection();
const votes = global.votes = JSON.parse(fs.readFileSync("storaged/votes.json"));

global.votes.save = () => {
    fs.writeFileSync("storaged/votes.json", JSON.stringify(votes));
};

global.votes.push = (e) => {
    Array.prototype.push.call(global.votes, e);
    global.votes.save();
}
global.votes.splice = (e, i) => {
    Array.prototype.splice.call(global.votes, e, i);
    global.votes.save();
}
global.saveVoteResult = (id) => {
    var vote = global.votes.find(vote => vote.voteID === id);
    fs.writeFileSync(`storaged/vote-${id}.json`, JSON.stringify(vote));
}
global.editResult = (id) => {
    var vts = [...global.votes];
    var vote = vts.find(vote => vote.voteID == id);
    if (vote) {
        var embed = new MessageEmbed()
            .setTitle(`投票已結束`)
            .setDescription(`投票結果如下`)
            .addField(`投票主題`, vote.title)
            .setColor('#0099ff');

        var voteOptions = vote.options;
        var voteResults = vote.voters;
        var voteCount = {};

        voteOptions.forEach(option => {
            voteCount[option.value] = 0;
        });

        voteResults.forEach(result => {
            voteCount[result]++;
        });

        voteOptions.forEach(option => {
            embed.addField(option.value, `${voteCount[option.value]} 票`, true);
        });

        client.channels.cache.fetch(vote.channelID).then(channel => {
            channel.fetch(vote.messageID).then(message => {
                message.edit({
                    embeds: [embed],
                    components: []
                });
            });
        });

        global.saveVoteResult(id);
        global.votes.splice(global.votes.findIndex(vote => vote.voteID == id), 1);
    }
}

global.votes.forEach((e) => {
    if (e.expiredAt < Date.now()) {
        global.editResult(e.voteID);
        return;
    }
    setTimeout(() => {
        global.editResult(e.voteID);
    }, e.expiredAt - Date.now());
});

client.on("ready", () => {
    console.log(`${client.user.tag} is online!`);
    global.client = client;
    require('./regCommands.js');
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand() && !interaction.isButton()) return;

    const command = commandsList.get(interaction.commandName);
    if (!command && !interaction.componentType) {
        interaction.reply("指令不存在");
        return;
    } else if (interaction.componentType) {
        if (interaction.componentType === "BUTTON") {
            const btnCommand = require("./events/buttonClick.js");
            btnCommand.execute(interaction);
        }
        return;
    };
    command.execute(interaction);
});

client.login(config.token);