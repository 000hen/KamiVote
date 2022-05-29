# KamiVote
這是一個基於Discord.js的簡單投票機器人，可以讓你的群組成員投票，並且可以設定投票時間。

## 特色

 * 讓群組人員投票
 * 每個人都可以發起投票
 * 自動儲存投票結果
 * 可以設定投票時間
 * 在投票中隱蔽投票者(除發起者外)

## 安裝
 1. 下載/克隆這個Repository
 2. 用`npm install`安裝依賴
 3. 執行`node main.js`或`npm start`啟動

## 設定
請在`config.json.example`中修改設定，並且複製到`config.json`中。

## 截圖
這台機器人是使用Slash Command的方式執行的。

 * 基本使用(/vote)  
 ![Vote](https://cdn.discordapp.com/attachments/964148338607927426/980285852649410660/unknown.png)

 * 投票結束  
 ![EndUp](https://cdn.discordapp.com/attachments/964148338607927426/980301808666832967/unknown.png)

 * 發起人可以查看投票結果(/result)  
 ![Result](https://cdn.discordapp.com/attachments/964148338607927426/980301862001598474/unknown.png)

 * 發起人也可以停止投票(/stop)  
 ![Stop](https://cdn.discordapp.com/attachments/964148338607927426/980301894327091260/unknown.png)