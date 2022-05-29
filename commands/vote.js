const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    name: "vote",
    description: "建立投票",
    command: new SlashCommandBuilder()
        .setName("vote")
        .setDescription("建立投票")
        .addStringOption((str) =>
            str.setName("title")
                .setDescription("投票主題")
                .setRequired(true))
        .addStringOption((str) =>
            str.setName("option1")
                .setDescription("投票選項 1")
                .setRequired(true))
        .addStringOption((str) =>
            str.setName("option2")
                .setDescription("投票選項 2")
                .setRequired(true))
        .addStringOption((str) =>
            str.setName("option3")
                .setDescription("投票選項 3")
                .setRequired(false))
        .addStringOption((str) =>
            str.setName("option4")
                .setDescription("投票選項 4")
                .setRequired(false))
        .addStringOption((str) =>
            str.setName("time")
                .setDescription("投票時間")
                .addChoices(
                    {
                        name: '5 分鐘',
                        value: '5n'
                    },
                    {
                        name: '10 分鐘',
                        value: '10n'
                    },
                    {
                        name: '1 小時',
                        value: '1h'
                    },
                    {
                        name: '3 小時',
                        value: '3h'
                    },
                    {
                        name: '5 小時',
                        value: '5h'
                    },
                    {
                        name: '12 小時',
                        value: '12h'
                    },
                    {
                        name: '1 天',
                        value: '1d'
                    },
                    {
                        name: '3 天',
                        value: '3d'
                    },
                    {
                        name: '5 天',
                        value: '5d'
                    },
                    {
                        name: '1 周',
                        value: '1w'
                    },
                    {
                        name: '1 個月',
                        value: '1m'
                    },
                    {
                        name: '3 個月',
                        value: '3m'
                    },
                    {
                        name: '永久',
                        value: 'forever'
                    }
                )),
    execute: async (interaction) => {
        const voteID = uuidv4();

        interaction.reply({
            content: `投票已建立成功!\n本次投票ID為 \`${voteID}\``,
            ephemeral: true
        });
        var values = interaction.options._hoistedOptions.filter(option => option.name.includes("option"));
        var options = [];
        
        try {
            const row = new MessageActionRow();

            values.forEach(option => {
                var id = uuidv4();
                row.addComponents(
                    new MessageButton()
                        .setCustomId(id)
                        .setLabel(option.value)
                        .setStyle('PRIMARY'),
                );
                options.push({
                    id: id,
                    value: option.value
                });
            });

            const embed = new MessageEmbed()
                .setTitle(`${interaction.user.tag} 建立了一個投票`)
                .setDescription(`點擊下方按鈕參與投票`)
                .addField('投票主題', interaction.options.getString('title'), true)
                .setColor('#0099ff');
            
            var timeInMilliseconds = 0;
            
            if (interaction.options.getString('time')) {
                // format time like 1h, 1d, 1w, 1m
                var time = interaction.options.getString('time');
                var timeUnit = time.slice(-1);
                var timeValue = parseInt(time.slice(0, -1));
                
                switch (timeUnit) {
                    case 'n':
                        timeInMilliseconds = timeValue * 60 * 1000;
                        break;
                    case 'h':
                        timeInMilliseconds = timeValue * 60 * 60 * 1000;
                        break;
                    case 'd':
                        timeInMilliseconds = timeValue * 24 * 60 * 60 * 1000;
                        break;
                    case 'w':
                        timeInMilliseconds = timeValue * 7 * 24 * 60 * 60 * 1000;
                        break;
                    case 'm':
                        timeInMilliseconds = timeValue * 30 * 24 * 60 * 60 * 1000;
                        break;
                    case 'forever':
                        timeInMilliseconds = 0;
                        break;
                }
                if (timeInMilliseconds > 0) {
                    var timestamp = Date.now() + timeInMilliseconds;
                    var time = new Date(timestamp);
                    var timeString = `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
                } else {
                    var timestamp = Date.now();
                    var time = Infinity;
                    var timeString = '永久';
                }
                embed.setTimestamp(timestamp);

                embed.setFooter({ text: `投票期限: ${timeString}` });
                embed.addField('投票截止', time === Infinity ? timeString : `<t:${Math.floor(time / 1000)}:R>`, true);
            }

            var msg = await interaction.channel.send({
                content: `本次投票ID為 \`${voteID}\``,
                embeds: [embed],
                components: [row]
            });

            var msgData = {
                voteID,
                msgID: msg.id,
                title: interaction.options.getString('title'),
                channelID: interaction.channel.id,
                options: options,
                createdAt: Date.now(),
                expiredAt: timeInMilliseconds ? Date.now() + timeInMilliseconds : null,
                creator: interaction.user.id,
                voters: [],
                message: msg
            }

            global.votes.push(msgData);

            if (timeInMilliseconds > 0) {
                setTimeout(() => {
                    global.editResult(voteID);
                }, timeInMilliseconds);
            }
        } catch (e) {
            console.log(e);
        }
    }
}