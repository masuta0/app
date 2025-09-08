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
          { name: 'ランダム', value: 'random2' },
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
          { name: 'ランダム', value: 'random2' },
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
          { name: 'ランダム', value: 'random2' },
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
    console.log('スラッシュコマンド登録完了！');
  } catch (error) {
    console.error(error);
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
    const cooldown = interaction.options.getInteger('cooldown') || 0.5; // デフォルト 0.5秒

    if (commandName === 'spam1') {
      messageText = '# Raid by Masumani\nhttps://discord.gg/msmn\nMASUMANI ON TOP';
      buttonId = `spam_btn_1|${mentionType}|${cooldown}`;
    } else if (commandName === 'spam2') {
      messageText = '# Raid by Masumani\nhttps://msmn.ozeu.site/\nMASUMANI ON TOP';
      buttonId = `spam_btn_2|${mentionType}|${cooldown}`;
    } else if (commandName === 'spam3') {
      messageText =
        '# Raid by Masumani\n' +
        '# [今すぐ植民地に参加](https://discord.gg/rrWWvxsXjZ)\n' +
        '# このサーバーはますまに共栄圏によって荒らされました。\n' +
        '# [今すぐ本鯖に参加](https://discord.gg/msmn)\n' +
        'https://cdn.discordapp.com/attachments/1236663988914229308/1287064050647306240/copy_7D48AD1D-7F83-4738-A7A7-0BE70C494F51.gif\n' +
        'https://cdn.discordapp.com/attachments/1236663988914229308/1287064282256900246/copy_89BE23AC-0647-468A-A5B9-504B5A98BC8B.gif';
      buttonId = `spam_btn_3|${mentionType}|${cooldown}`;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(buttonId).setLabel('実行').setStyle(ButtonStyle.Primary),
    );

    await interaction.reply({
      content: `実行「${commandName}」を選びました。ボタンで開始してください。`,
      components: [row],
      flags: 64, // ephemeral の代わり
    });
  }

  // ---------------- ボタン処理 ----------------
  if (interaction.isButton()) {
    const [btnType, mentionType, rawCooldown] = interaction.customId.split('|');
    const interval = parseFloat(rawCooldown) * 1000 || 500; // デフォルト0.5秒

    let text = '';
    switch (btnType) {
      case 'spam_btn_1':
        text =
          '# Raid by Masumani\nhttps://discord.gg/msmn\nこのサーバーはますまに共栄圏によって荒らされました\nMASUMANI ON TOP';
        break;
      case 'spam_btn_2':
        text = '# Raid by Masumani\nhttps://msmn.ozeu.site/\nMASUMANI ON TOP';
        break;
      case 'spam_btn_3':
        text =
          '# Raid by Masumani\n' +
          '# [今すぐ植民地に参加](https://discord.gg/rrWWvxsXjZ)\n' +
          '# このサーバーはますまに共栄圏によって荒らされました。\n' +
          '# [今すぐ本鯖に参加](https://discord.gg/msmn)\n' +
          'https://cdn.discordapp.com/attachments/1236663988914229308/1287064050647306240/copy_7D48AD1D-7F83-4738-A7A7-0BE70C494F51.gif\n' +
          'https://cdn.discordapp.com/attachments/1236663988914229308/1287064282256900246/copy_89BE23AC-0647-468A-A5B9-504B5A98BC8B.gif';
        break;
    }

    // 応答保留（考え中は表示されない）
    await interaction.deferReply({ fetchReply: true });

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
      setTimeout(async () => {
        const mentionText = await getMention();
        const payload = {
          content: `${text}\n${mentionText}`,
          allowedMentions: { parse: ['users', 'everyone'] },
        };

        if (i === 0) {
          await interaction.editReply(payload);
        } else {
          await interaction.followUp(payload);
        }
      }, i * interval);
    }
  }
});

// ---------------- Bot起動 ----------------
client.login(process.env.TOKEN);