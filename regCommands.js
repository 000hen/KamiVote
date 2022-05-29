const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('./config.json');
const fs = require('fs');

const rest = new REST({ version: '9' }).setToken(config.token);

const commands = [];

(async () => {
    console.log(`Registering commands...`);

    var commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        var command = require(`./commands/${file}`);
        console.log(`Registering ${command.name}...`);
        commands.push(command.command.toJSON());
        global.commandsList.set(command.name, command);
    }

    console.log(`Registering commands... Done!`);
    console.log(`Registering routes...`);

    const clientID = config.appid;
    await rest.put(
        Routes.applicationCommands(clientID), {
            body: commands
        },
    );

    rest.get(Routes.applicationGuildCommands(clientID, "698551378246631436"))
        .then(data => {
            const promises = [];
            for (const command of data) {
                const deleteUrl = `${Routes.applicationGuildCommands(clientID, "698551378246631436")}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
            }
            return Promise.all(promises);
        });

    // await rest.put(
    //     Routes.applicationGuildCommands(clientID, "698551378246631436"), {
    //         body: commands
    //     }
    // );

    console.log(`Registered commands!`);
})();