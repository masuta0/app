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

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

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
        .setDescription('低速対策')
        .setRequired(false)
        .addChoices(
          { name: '最速 (0.2秒)', value: 0 }, // 特別扱いで 0 → 実際は0.2秒に変換
          { name: '1秒', value: 1 },
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
        .setRequired(false),
    )
    .addIntegerOption(option =>
      option
        .setName('cooldown')
        .setDescription('低速対策')
        .setRequired(false),
    ),

  new SlashCommandBuilder()
    .setName('spam3')
    .setDescription('植民地,GIF付き')
    .addStringOption(option =>
      option
        .setName('mention')
        .setDescription('メンション設定')
        .setRequired(false),
    )
    .addIntegerOption(option =>
      option
        .setName('cooldown')
        .setDescription('低速対策')
        .setRequired(false),
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
    const mentionType = interaction.options.getString('mention');
    const cooldown = interaction.options.getInteger('cooldown');

    let messageText = '';
    let buttonId = '';

    if (commandName === 'spam1') {
      messageText = 'スパムメッセージ1';
      buttonId = `spam_btn_1_${mentionType}_${cooldown}`;
    } else if (commandName === 'spam2') {
      messageText = 'スパムメッセージ2';
      buttonId = `spam_btn_2_${mentionType}_${cooldown}`;
    } else if (commandName === 'spam3') {
      messageText = 'スパムメッセージ3';
      buttonId = `spam_btn_3_${mentionType}_${cooldown}`;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(buttonId).setLabel('実行').setStyle(ButtonStyle.Primary),
    );

    await interaction.reply({
      content: `スパム開始「${commandName}」\nメンション: ${mentionType}, クールタイム: ${cooldown}秒`,
      components: [row],
      ephemeral: true,
    });
  }

  if (interaction.isButton()) {
    if (interaction.customId.startsWith('spam_btn_')) {
      const parts = interaction.customId.split('_');
      const spamType = parts[2];
      const mentionType = parts[3];
      const cooldown = parseInt(parts[4] || '5');

      let text = '';
      switch (spamType) {
        case '1':
          text = '# Raid by Masumani\nこのサーバーはますまに共栄圏によって荒らされました\n https://discord.gg/msmn\n  MASUMANI ON TOP';
          break;
        case '2':
          text = '# Raid by Masumani\n https://msmn.ozeu.site/\n  MASUMANI ON TOP';
          break;
        case '3':
          text = '# Raid by Masumani \n # [今すぐ植民地に参加](https://discord.gg/rrWWvxsXjZ)\n# このサーバーはますまに共栄圏によって荒らされました。\n  # [今すぐ本鯖に参加](https://discord.gg/msmn)\n  ||@everyone|| \n https://cdn.discordapp.com/attachments/1236663988914229308/1287064050647306240/copy_7D48AD1D-7F83-4738-A7A7-0BE70C494F51.gif?ex=66f02f4e&is=66eeddce&hm=e821ec08ea8e34d55b84244e4b55fe008e9e56cb4efbbd8914f33f55c8424d46& \n https://cdn.discordapp.com/attachments/1236663988914229308/1287064282256900246/copy_89BE23AC-0647-468A-A5B9-504B5A98BC8B.gif?ex=66f02f85&is=66eede05&hm=af1cc50c8fc801bf875c6a1000ca13937a8bb87957b479c442774718d81b6318&';
          break;
      }

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

      // クールタイム
      const rawCooldown = parseFloat(parts[4]);
      const cooldown = rawCooldown && rawCooldown > 0 ? rawCooldown : 0.2;
      const interval = (cooldown * 1000) + 100;
      // 5回送信
      for (let i = 0; i < 5; i++) {
        setTimeout(async () => {
          const mentionText = await getMention();
          const payload = {
            content: `${text}\n${mentionText}`,
            ephemeral: false,
            allowedMentions: { parse: ['users', 'everyone'] },
          };

          if (i === 0) {
            await interaction.reply(payload);
          } else {
            await interaction.followUp(payload);
          }
        }, i * interval);
      }
    }
  }
});

// ---------------- Bot起動 ----------------
client.login(process.env.TOKEN);