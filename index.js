const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
} = require('discord.js');
require('dotenv').config();

// 環境変数のチェック
if (!process.env.TOKEN) {
  console.error('エラー: TOKEN が .env ファイルに設定されていません');
  process.exit(1);
}

if (!process.env.CLIENT_ID) {
  console.error('エラー: CLIENT_ID が .env ファイルに設定されていません');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 共通オプション定義関数
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

// スラッシュコマンド定義
const commands = [
  addCommonOptions(new SlashCommandBuilder().setName('masumani1').setDescription('シンプル')),
  addCommonOptions(new SlashCommandBuilder().setName('masumani2').setDescription('招待リンク回避')),
  addCommonOptions(new SlashCommandBuilder().setName('masumani3').setDescription('植民地,GIF付き')),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('スラッシュコマンド登録中...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('✅ スラッシュコマンド登録完了！');
  } catch (error) {
    console.error('❌ コマンド登録エラー:', error);
  }
})();

// メッセージテキストマップ
const messageTexts = {
  masumani1: '# Raid by Masumani\nhttps://discord.gg/k248PuD2C2\nMASUMANI ON TOP',
  masumani2: '# Raid by Masumani\n https://x.gd/masueikyu\n MASUMANI ON TOP |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| _ _ _ _ _ _ https://nemtudo.me/e/4EQ2',
  masumani3: '# Raid by Masumani\n' +
    '# このサーバーはますまに共栄圏によって荒らされました。\n' +
    '# [今すぐ本鯖に参加](https://discord.gg/k248PuD2C2)\n' +
    'https://cdn.discordapp.com/attachments/1236663988914229308/1287064050647306240/copy_7D48AD1D-7F83-4738-A7A7-0BE70C494F51.gif\n' +
    'https://cdn.discordapp.com/attachments/1236663988914229308/1287064282256900246/copy_89BE23AC-0647-468A-A5B9-504B5A98BC8B.gif',
};

// コマンド/ボタン処理
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;
    const mentionType = interaction.options.getString('mention') || 'none';
    const cooldown = interaction.options.getInteger('cooldown') || 1;
    const buttonId = `masumani_btn_${commandName.slice(-1)}|${mentionType}|${cooldown}`;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(buttonId).setLabel('実行').setStyle(ButtonStyle.Primary),
    );

    await interaction.reply({
      content: `実行「${commandName}」`,
      components: [row],
      ephemeral: true,
    });
  } else if (interaction.isButton()) {
    const [btnType, mentionType, rawCooldown] = interaction.customId.split('|');
    const interval = (parseInt(rawCooldown, 10) || 1) * 1000;
    const commandKey = `masumani${btnType.slice(-1)}`;
    const text = messageTexts[commandKey];

    await interaction.deferReply({ ephemeral: false });

    const getMention = () => mentionType === 'everyone' ? '@everyone' : '';
    const delay = ms => new Promise(res => setTimeout(res, ms));

    let hasFailed = false;

    for (let i = 0; i < 5; i++) {
      if (hasFailed) break;

      const mentionText = getMention();
      const finalContent = mentionText ? `${text}\n${mentionText}` : text;

      const payload = {
        content: finalContent,
        allowedMentions: { parse: mentionType === 'everyone' ? ['everyone'] : [] },
      };

      try {
        if (i === 0) {
          await interaction.editReply(payload);
        } else {
          await interaction.followUp(payload);
        }
      } catch (err) {
        console.error('送信エラー:', err);

        let reason = '不明なエラー';
        if (err.code === 200000) reason = 'AutoMod によってブロックされました。';
        if (err.code === 50001) reason = 'Bot に必要な権限がありません (Missing Access)。';
        if (err.code === 50013) reason = '権限不足: メッセージを送信できません。';
        if (err.code === 429) reason = 'レートリミット: 再試行中...';

        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(interaction.customId)
            .setLabel('実行（無効）')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        );

        try {
          await interaction.followUp({
            content: `⚠️ **送信に失敗しました**\n理由: ${reason}\n/masumani2の使用をおすすめします。`,
            ephemeral: true,
          });
          await interaction.editReply({
            content: interaction.message?.content || '実行中...',
            components: [disabledRow],
          });
        } catch (updateErr) {
          console.error('ボタン無効化エラー:', updateErr);
        }

        hasFailed = true;
        break;
      }

      if (i < 4) await delay(interval);
    }
  }
});

// Bot起動
client.on('ready', () => {
  console.log(`✅ Bot起動完了: ${client.user.tag}`);
});

// Koyeb KeepAliveサーバー
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("✅ Discord Bot is running on Koyeb!");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🌐 KeepAliveサーバー起動中: ポート ${PORT}`);
});

client.login(process.env.TOKEN);