module.exports = {
    name: "buttonHandler",
    description: "按鈕事件處理",
    execute: async (interaction) => {
        const messageID = interaction.message.id;
        const vote = global.votes.find(vote => vote.msgID === messageID);
        if (!vote) {
            interaction.reply({
                content: "投票不存在",
                ephemeral: true
            });
            return;
        }
        const userVote = vote.voters.findIndex(vote => vote.userID === interaction.user.id);
        const voteIndex = vote.options.findIndex(option => option.id === interaction.customId);

        if (vote && userVote === -1) {
            if (voteIndex === -1) {
                interaction.reply({
                    content: "選項不存在",
                    ephemeral: true
                });
                return;
            } else {
                vote.voters.push({
                    userID: interaction.user.id,
                    userTag: interaction.user.tag,
                    optionID: interaction.customId
                });
                interaction.reply({
                    content: `已投給 \`${vote.options[voteIndex].value}\`, 已有 ${vote.voters.length} 人投票`,
                    ephemeral: true
                });
                global.votes.save();
            }
        } else if (userVote !== -1) {
            interaction.reply({
                content: `您已經投給 \`${vote.options.find(e => e.id === vote.voters[userVote].optionID).value}\` 了!`,
                ephemeral: true
            });
        }
    }
}