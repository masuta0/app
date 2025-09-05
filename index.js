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

// Botクライアント作成（GuildMembers Intent が必要！）
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// ---------------- スラッシュコマンド定義 ----------------
const commands = [
  new SlashCommandBuilder()
    .setName('spam1')
    .setDescription('シンプルスパム')
    .addStringOption(option =>
      option
        .setName('mention')
        .setDescription('メンション設定')
        .setRequired(true)
        .addChoices(
          { name: 'なし', value: 'none' },
          { name: 'ランダム2人', value: 'random2' },
          { name: '@everyone', value: 'everyone' },
        )
    ),
  new SlashCommandBuilder()
    .setName('spam2')
    .setDescription('招待リンク対策回避')
    .addStringOption(option =>
      option
        .setName('mention')
        .setDescription('メンション設定')
        .setRequired(true)
        .addChoices(
          { name: 'なし', value: 'none' },
          { name: 'ランダム2人', value: 'random2' },
          { name: '@everyone', value: 'everyone' },
        )
    ),
  new SlashCommandBuilder()
    .setName('spam3')
    .setDescription('植民地,GIF付き')
    .addStringOption(option =>
      option
        .setName('mention')
        .setDescription('メンション設定')
        .setRequired(true)
        .addChoices(
          { name: 'なし', value: 'none' },
          { name: 'ランダム2人', value: 'random2' },
          { name: '@everyone', value: 'everyone' },
        )
    ),
].map(command => command.toJSON());

// ---------------- コマンド登録 ----------------
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
  try {
    console.log('スラッシュコマンド登録中...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log('スラッシュコマンド登録完了！');
  } catch (error) {
    console.error(error);
  }
})();

// ---------------- インタラクション処理 ----------------
client.on(Events.InteractionCreate, async interaction => {
  // スラッシュコマンド
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;
    const mentionType = interaction.options.getString('mention'); // 選択したメンション種類

    let messageText = '';
    let buttonId = '';

    if (commandName === 'spam1') {
      messageText = 'スパムメッセージ1';
      buttonId = `spam_btn_1_${mentionType}`;
    } else if (commandName === 'spam2') {
      messageText = 'スパムメッセージ2';
      buttonId = `spam_btn_2_${mentionType}`;
    } else if (commandName === 'spam3') {
      messageText = 'スパムメッセージ3';
      buttonId = `spam_btn_3_${mentionType}`;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(buttonId)
        .setLabel('実行')
        .setStyle(ButtonStyle.Primary),
    );

    await interaction.reply({
      content: `スパム開始「${commandName}」（メンション: ${mentionType}）`,
      components: [row],
      ephemeral: true,
    });
  }

  // ボタン
  if (interaction.isButton()) {
    if (interaction.customId.startsWith('spam_btn_')) {
      const parts = interaction.customId.split('_');
      const msgId = parts[2]; // 1 / 2 / 3
      const mentionType = parts[3]; // none / random2 / everyone

      // 出すテキストを決定
      let text = '';
      if (msgId === '1') text = '# Raid by Masumani\nこのサーバーはますまに共栄圏によって荒らされました\n https://discord.gg/msmn\n  MASUMANI ON TOP';
      if (msgId === '2') text = '# Raid by Masumani\n https://msmn.ozeu.site/\n  MASUMANI ON TOP';
      if (msgId === '3') text = '# Raid by Masumani \n # [今すぐ植民地に参加](https://discord.gg/rrWWvxsXjZ)\n# このサーバーはますまに共栄圏によって荒らされました。\n  # [今すぐ本鯖に参加](https://discord.gg/msmn)\n  ||@everyone|| \n https://cdn.discordapp.com/attachments/1236663988914229308/1287064050647306240/copy_7D48AD1D-7F83-4738-A7A7-0BE70C494F51.gif?ex=66f02f4e&is=66eeddce&hm=e821ec08ea8e34d55b84244e4b55fe008e9e56cb4efbbd8914f33f55c8424d46& \n https://cdn.discordapp.com/attachments/1236663988914229308/1287064282256900246/copy_89BE23AC-0647-468A-A5B9-504B5A98BC8B.gif?ex=66f02f85&is=66eede05&hm=af1cc50c8fc801bf875c6a1000ca13937a8bb87957b479c442774718d81b6318&';

      // メンションを決める関数
      const getMention = async () => {
        if (mentionType === 'random2') {
          const members = await interaction.guild.members.fetch();
          const nonBots = members.filter(m => !m.user.bot);
          if (nonBots.size === 0) return '';
          const randomMembers = nonBots.random(2);
          return randomMembers.map(m => `<@${m.id}>`).join(' ');
        } else if (mentionType === 'everyone') {
          return '@everyone';
        }
        return '';
      };

      // 5回送信
      for (let i = 0; i < 5; i++) {
        const mentionText = await getMention();
        if (i === 0) {
          await interaction.reply({
            content: `${text}\n${mentionText}`,
            ephemeral: false,
          });
        } else {
          await interaction.followUp({
            content: `${text}\n${mentionText}`,
            ephemeral: false,
          });
        }
      }
    }
  }
});

// ---------------- Bot起動 ----------------
client.login(process.env.TOKEN);