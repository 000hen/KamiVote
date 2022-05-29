const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
    name: "result",
    description: "投票結果",
    command: new SlashCommandBuilder()
        .setName("result")
        .setDescription("投票結果")
        .addStringOption((str) =>
            str.setName("voteid")
                .setDescription("投票ID")
                .setRequired(true)),
    execute: async (interaction) => {
        const voteID = interaction.options.getString("voteid");
        var vote = global.votes.find(vote => vote.voteID === voteID);

        if (fs.existsSync(`./storaged/${interaction.guild.id}/vote-${voteID}.json`) && !vote) {
            vote = JSON.parse(fs.readFileSync(`./storaged/${interaction.guild.id}/vote-${voteID}.json`));
        }

        if (!vote) {
            interaction.reply({
                content: "投票不存在",
                ephemeral: true
            });
            return;
        }

        if (vote.creator !== interaction.user.id) {
            interaction.reply({
                content: "您不是投票的創建者",
                ephemeral: true
            });
            return;
        }

        var time = new Date(vote.expiredAt);
        var timeString = `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;

        const embed = new MessageEmbed()
            .setTitle("投票明細")
            .setColor('#0099ff')
            .addField("投票主題", vote.title, true)
            .addField("投票截止", vote.expiredAt ? `<t:${Math.floor(vote.expiredAt / 1000)}:R> (${timeString})` : "N/A", false)
            .addField("投票選項", vote.options.map(option => option.value).join(", "))
            .addField("投票人數", `${vote.voters.length}`, true)
            .addField("投票者", vote.voters.map(vt => `${vt.userTag}(投給 \`${vote.options.find(e => e.id === vt.optionID).value}\`)`).join(", "), false);
        
        vote.options.forEach(option => {
            const voters = vote.voters.filter(vote => vote.optionID === option.id);
            embed.addField(option.value, `**${voters.length}** 票 (${(voters.length / vote.voters.length) * 100}%)`, true);
        });

        interaction.reply({
            content: "投票結果",
            embeds: [embed],
            ephemeral: true
        });
    }
}