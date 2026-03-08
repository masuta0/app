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
const { TOKEN, CLIENT_ID } = process.env;
if (!TOKEN || !CLIENT_ID) {
  console.error('エラー: TOKEN または CLIENT_ID が .env ファイルに設定されていません');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ---------------- スラッシュコマンド定義 ----------------
const createCommand = (name, description) => new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
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

const commands = [
  createCommand('masumani1', 'シンプル').toJSON(),
  createCommand('masumani2', '招待リンク回避').toJSON(),
  createCommand('masumani3', '植民地,GIF付き').toJSON(),
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('スラッシュコマンド登録中...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ スラッシュコマンド登録完了！');
  } catch (error) {
    console.error('❌ コマンド登録エラー:', error);
  }
})();

// メッセージテンプレート
const messageTemplates = {
  masumani1: '# Raid by Masumani\nhttps://discord.gg/k248PuD2C2\nMASUMANI ON TOP',
  masumani2: '# Raid by Masumani\n https://x.gd/masueikyu\n MASUMANI ON TOP |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| _ _ _ _ _ _ https://nemtudo.me/e/4EQ2',
  masumani3: '# Raid by Masumani\n# このサーバーはますまに共栄圏によって荒らされました。\n# [今すぐ本鯖に参加](https://discord.gg/k248PuD2C2)\nhttps://cdn.discordapp.com/attachments/1236663988914229308/1287064050647306240/copy_7D48AD1D-7F83-4738-A7A7-0BE70C494F51.gif\nhttps://cdn.discordapp.com/attachments/1236663988914229308/1287064282256900246/copy_89BE23AC-0647-468A-A5B9-504B5A98BC8B.gif',
};

// ---------------- コマンドとボタン処理 ----------------
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    const mentionType = interaction.options.getString('mention') || 'none';
    const cooldown = interaction.options.getInteger('cooldown') || 1;
    const buttonId = `${commandName}|${mentionType}|${cooldown}`;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(buttonId).setLabel('実行').setStyle(ButtonStyle.Primary),
    );

    await interaction.reply({
      content: `実行「${commandName}」`,
      components: [row],
      ephemeral: true,
    });
  } else if (interaction.isButton()) {
    const [commandName, mentionType, rawCooldown] = interaction.customId.split('|');
    const interval = parseInt(rawCooldown, 10) * 1000;
    const text = messageTemplates[commandName];

    await interaction.deferReply({ ephemeral: false });

    let hasFailed = false;
    const mention = mentionType === 'everyone' ? '@everyone' : '';
    const allowedMentions = mentionType === 'everyone' ? { parse: ['everyone'] } : { parse: [] };

    for (let i = 0; i < 5 && !hasFailed; i++) {
      const content = mention ? `${text}\n${mention}` : text;
      const payload = { content, allowedMentions };

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
        else if (err.code === 50001) reason = 'Bot に必要な権限がありません (Missing Access)。';
        else if (err.code === 50013) reason = '権限不足: メッセージを送信できません。';
        else if (err.message) reason = err.message;

        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(interaction.customId)
            .setLabel('実行（無効）')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        );

        try {
          await interaction.followUp({
            content: `⚠️ **送信に失敗しました**\n理由: ${reason}/masumani2の使用をおすすめします。`,
            ephemeral: true,
          });
          await interaction.editReply({ components: [disabledRow] });
        } catch (updateErr) {
          console.error('ボタン無効化エラー:', updateErr);
        }

        hasFailed = true;
      }

      if (i < 4 && !hasFailed) await new Promise(res => setTimeout(res, interval));
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

client.login(TOKEN);