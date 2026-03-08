const {
  REST,
  Routes,
  SlashCommandBuilder,
} = require('discord.js');
require('dotenv').config();

// 環境変数チェック
if (!process.env.TOKEN) {
  console.error('エラー: TOKEN が .env ファイルに設定されていません');
  process.exit(1);
}

if (!process.env.CLIENT_ID) {
  console.error('エラー: CLIENT_ID が .env ファイルに設定されていません');
  process.exit(1);
}

// 共通オプション関数
const addCommonOptions = (command) => {
  return command
    .addStringOption(option =>
      option
        .setName('mention')
        .setDescription('メンション設定')
        .setRequired(false)
        .addChoices(
          { name: 'なし', value: 'none' },
          { name: '@everyone', value: 'everyone' },
        ),
    )
    .addIntegerOption(option =>
      option
        .setName('cooldown')
        .setDescription('送信間隔 秒')
        .setRequired(false)
        .addChoices(
          { name: '5秒', value: 5 },
          { name: '10秒', value: 10 },
          { name: '15秒', value: 15 },
          { name: '30秒', value: 30 },
          { name: '60秒', value: 60 },
        ),
    );
};

// コマンド定義
const commands = [
  addCommonOptions(new SlashCommandBuilder().setName('masumani1').setDescription('シンプル')),
  addCommonOptions(new SlashCommandBuilder().setName('masumani2').setDescription('招待リンク回避')),
  addCommonOptions(new SlashCommandBuilder().setName('masumani3').setDescription('植民地,GIF付き')),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// 登録実行
(async () => {
  try {
    console.log('スラッシュコマンド登録中...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('✅ スラッシュコマンド登録完了！');
  } catch (error) {
    console.error('❌ コマンド登録エラー:', error);
  }
  process.exit(0);  // 登録完了で終了
})();

// KeepAliveサーバー (オフライン不要だが残す)
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("✅ Discord Command Register is running!");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🌐 KeepAliveサーバー起動中: ポート ${PORT}`);
});