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
  console.error('❌ エラー: TOKEN が .env ファイルに設定されていません');
  process.exit(1);
}

if (!process.env.CLIENT_ID) {
  console.error('❌ エラー: CLIENT_ID が .env ファイルに設定されていません');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ---------------- スラッシュコマンド定義 ----------------
const commands = [
  new SlashCommandBuilder()
    .setName('spam1')
    .setDescription('シンプルスパム')
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
        .setDescription('低速対策 (送信間隔 秒)')
        .setRequired(false)
        .addChoices(
          { name: '5秒', value: 5 },
          { name: '10秒', value: 10 },
          { name: '15秒', value: 15 },
          { name: '30秒', value: 30 },
          { name: '60秒', value: 60 },
        ),
    ),

  new SlashCommandBuilder()
    .setName('spam2')
    .setDescription('招待リンク対策回避')
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
        .setDescription('低速対策 (送信間隔 秒)')
        .setRequired(false)
        .addChoices(
          { name: '5秒', value: 5 },
          { name: '10秒', value: 10 },
          { name: '15秒', value: 15 },
          { name: '30秒', value: 30 },
          { name: '60秒', value: 60 },
        ),
    ),

  new SlashCommandBuilder()
    .setName('spam3')
    .setDescription('植民地,GIF付き')
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
        .setDescription('低速対策 (送信間隔 秒)')
        .setRequired(false)
        .addChoices(
          { name: '5秒', value: 5 },
          { name: '10秒', value: 10 },
          { name: '15秒', value: 15 },
          { name: '30秒', value: 30 },
          { name: '60秒', value: 60 },
        ),
    ),
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

// ---------------- コマンドとボタン処理 ----------------
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    let messageText = '';
    let buttonId = '';

    // オプション取得
    const mentionType = interaction.options.getString('mention') || 'none';
    const cooldown = interaction.options.getInteger('cooldown') || 0.7; // デフォルト 0.7秒

    if (commandName === 'spam1') {
      messageText = '# Raid by Masumani\nhttps://discord.gg/masu\nMASUMANI ON TOP';
      buttonId = `spam_btn_1|${mentionType}|${cooldown}`;
    } else if (commandName === 'spam2') {
      messageText = '# Raid by Masumani\n  https://x.gd/masumanisaiken\n MASUMANI ON TOP ||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​|| _ _ _ _ _ _ https://nemtudo.me/e/4EQ2';
      buttonId = `spam_btn_2|${mentionType}|${cooldown}`;
    } else if (commandName === 'spam3') {
      messageText =
        '# Raid by Masumani\n' +
        '# [今すぐ植民地に参加](https://discord.gg/rrWWvxsXjZ)\n' +
        '# このサーバーはますまに共栄圏によって荒らされました。\n' +
        '# [今すぐ本鯖に参加](https://discord.gg/masu)\n' +
        'https://cdn.discordapp.com/attachments/1236663988914229308/1287064050647306240/copy_7D48AD1D-7F83-4738-A7A7-0BE70C494F51.gif\n' +
        'https://cdn.discordapp.com/attachments/1236663988914229308/1287064282256900246/copy_89BE23AC-0647-468A-A5B9-504B5A98BC8B.gif';
      buttonId = `spam_btn_3|${mentionType}|${cooldown}`;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(buttonId).setLabel('実行').setStyle(ButtonStyle.Primary),
    );

    await interaction.reply({
      content: `実行「${commandName}」`,
      components: [row],
      flags: 64, // ephemeral
    });
  }

  // ---------------- ボタン処理 ----------------
  if (interaction.isButton()) {
    const [btnType, mentionType, rawCooldown] = interaction.customId.split('|');
    const interval = parseFloat(rawCooldown) * 1000 || 300; // デフォルト0.7秒

    let text = '';
    switch (btnType) {
      case 'spam_btn_1':
        text =
          '# Raid by Masumani\nhttps://discord.gg/masu\nこのサーバーはますまに共栄圏によって荒らされました\nMASUMANI ON TOP';
        break;
      case 'spam_btn_2':
        text = '# Raid by Masumani\n https://x.gd/masumanisaiken\n MASUMANI ON TOP ||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​|| _ _ _ _ _ _ https://nemtudo.me/e/4EQ2';
        break;
      case 'spam_btn_3':
        text =
          '# Raid by Masumani\n' +
          '# [今すぐ植民地に参加](https://discord.gg/rrWWvxsXjZ)\n' +
          '# このサーバーはますまに共栄圏によって荒らされました。\n' +
          '# [今すぐ本鯖に参加](https://discord.gg/masu)\n' +
          'https://cdn.discordapp.com/attachments/1236663988914229308/1287064050647306240/copy_7D48AD1D-7F83-4738-A7A7-0BE70C494F51.gif\n' +
          'https://cdn.discordapp.com/attachments/1236663988914229308/1287064282256900246/copy_89BE23AC-0647-468A-A5B9-504B5A98BC8B.gif';
        break;
    }

    // 応答保留
    await interaction.deferReply();

    // メンションを決める関数
    const getMention = () => {
      if (mentionType === 'everyone') {
        return '@everyone';
      }
      return '';
    };

    // 遅延用の関数
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // 送信失敗フラグ
    let hasFailed = false;

    // 5回送信（順番に実行される）
    for (let i = 0; i < 5; i++) {
      // すでに失敗している場合はループを抜ける
      if (hasFailed) break;

      const mentionText = getMention();
      const finalContent = mentionText ? `${text}\n${mentionText}` : text;

      const payload = {
        content: finalContent,
        allowedMentions: mentionType === 'everyone' ? { parse: ['everyone'] } : { parse: [] },
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
        if (err.code === 200000) {
          reason = 'AutoMod によってブロックされました。';
        } else if (err.code === 50001) {
          reason = 'Bot に必要な権限がありません (Missing Access)。';
        } else if (err.code === 50013) {
          reason = '権限不足: メッセージを送信できません。';
        } else if (err.message) {
          reason = err.message;
        }

        // ボタンを無効化
        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(interaction.customId)
            .setLabel('実行（無効）')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        );

        try {
          // 本人にだけ見える警告メッセージを送信
          await interaction.followUp({
            content: `⚠️ **送信に失敗しました**\n理由: ${reason}/spam2の使用をおすすめします。`,
            flags: 64, // ephemeral (実行者のみに表示)
          });

          // 元のメッセージのボタンを無効化
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

      // 間隔待機
      if (i < 4) await delay(interval);
    }
  }
});

// ---------------- Bot起動 ----------------
client.on('ready', () => {
  console.log(`✅ Bot起動完了: ${client.user.tag}`);
});
// ==============================
// 🌐 Koyeb KeepAliveサーバー
// ==============================
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