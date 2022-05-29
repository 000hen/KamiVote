const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: "stop",
    description: "停止投票",
    command: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("停止投票")
        .addStringOption((str) =>
            str.setName("voteid")
                .setDescription("投票ID")
                .setRequired(true)),
    execute: async (interaction) => {
        const voteID = interaction.options.getString("voteid");
        const vote = global.votes.find(vote => vote.voteID === voteID);

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

        interaction.reply({
            content: `已將 \`${voteID}\` 的投票停止了`,
            ephemeral: true
        });
        global.editResult(voteID);
    }
}