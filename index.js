const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// スラッシュコマンド登録
const commands = [
  new SlashCommandBuilder().setName('spam1').setDescription('シンプル'),
  new SlashCommandBuilder().setName('spam2').setDescription('discordリンク対策'),
  new SlashCommandBuilder().setName('spam3').setDescription('植民地やGiFで長め'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('スラッシュコマンド登録中...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    console.log('スラッシュコマンド登録完了！');
  } catch (error) {
    console.error(error);
  }
})();

// コマンドとボタン処理
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    let messageText = '';
    let buttonId = '';

    if (commandName === 'spam1') {
      messageText = '# Raid by Masumani\n https://discord.gg/msmn\n  MASUMANI ON TOP ||@everyone||';
      buttonId = 'spam_btn_1';
    } else if (commandName === 'spam2') {
      messageText = '# Raid by Masumani\n https://msmn.ozeu.site/\n  MASUMANI ON TOP';
      buttonId = 'spam_btn_2';
    } else if (commandName === 'spam3') {
      messageText = '# Raid by Masumani \n # [今すぐ植民地に参加]\n# このサーバーはますまに共栄圏によって荒らされました。\n(https://discord.gg/rrWWvxsXjZ)\n   # [今すぐ本鯖に参加](https://discord.gg/msmn)\n  ||@everyone|| \n https://cdn.discordapp.com/attachments/1236663988914229308/1287064050647306240/copy_7D48AD1D-7F83-4738-A7A7-0BE70C494F51.gif?ex=66f02f4e&is=66eeddce&hm=e821ec08ea8e34d55b84244e4b55fe008e9e56cb4efbbd8914f33f55c8424d46& \n https://cdn.discordapp.com/attachments/1236663988914229308/1287064282256900246/copy_89BE23AC-0647-468A-A5B9-504B5A98BC8B.gif?ex=66f02f85&is=66eede05&hm=af1cc50c8fc801bf875c6a1000ca13937a8bb87957b479c442774718d81b6318&';
      buttonId = 'spam_btn_3';
    }

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(buttonId)
          .setLabel('実行')
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({
      content: `実行「${commandName}」`,
      components: [row],
      ephemeral: true
    });
  }

  // ボタンの処理
  if (interaction.isButton()) {
    if (interaction.customId.startsWith('spam_btn_')) {
      let text = '';

      switch (interaction.customId) {
        case 'spam_btn_1':
          text = '# Raid by Masumani\n https://discord.gg/msmn\n  MASUMANI ON TOP \n||@everyone||';
          break;
        case 'spam_btn_2':
          text = '# Raid by Masumani\n https://msmn.ozeu.site/\n  MASUMANI ON TOP';
          break;
        case 'spam_btn_3':
          text = '# Raid by Masumani \n # [今すぐ植民地に参加](https://discord.gg/rrWWvxsXjZ)\n# このサーバーはますまに共栄圏によって荒らされました。  # [今すぐ本鯖に参加](https://discord.gg/msmn)\n  ||@everyone|| \n https://cdn.discordapp.com/attachments/1236663988914229308/1287064050647306240/copy_7D48AD1D-7F83-4738-A7A7-0BE70C494F51.gif?ex=66f02f4e&is=66eeddce&hm=e821ec08ea8e34d55b84244e4b55fe008e9e56cb4efbbd8914f33f55c8424d46& \n https://cdn.discordapp.com/attachments/1236663988914229308/1287064282256900246/copy_89BE23AC-0647-468A-A5B9-504B5A98BC8B.gif?ex=66f02f85&is=66eede05&hm=af1cc50c8fc801bf875c6a1000ca13937a8bb87957b479c442774718d81b6318&';
          break;
      }

      await interaction.reply({
        content: text,
        ephemeral: false
      });
    }
  }
});

client.login(process.env.TOKEN);
