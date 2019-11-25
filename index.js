import User from './user';
import {
  saveUser,
  getUsers,
} from './db'

const TelegramBot = require('node-telegram-bot-api');
const options = {
  polling: true
};

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, options);
const socialCreditPlus = 'CAADAQADAgADf3BGHAXMZNg3IivIFgQ';
const socialCreditMinus = 'CAADAQADAwADf3BGHENZiEtY50bNFgQ';

bot.on('message', async (msg) => {
  if (isReplyAndSticker(msg)) {
    if (msg.sticker.file_id == socialCreditPlus) {
      handleCredit(msg, 20);
    } else if (msg.sticker.file_id == socialCreditMinus) {
      handleCredit(msg, -20);
    }
  }
});

async function handleCredit(msg, amount) {
  const chatId = msg.chat.id;
  const firstName = msg.reply_to_message.from.first_name;
  const userId = msg.reply_to_message.from.id;

  let user = await User.getOrCreateUser(userId, firstName);
  user.addCredit(amount);
  saveUser(user);
  bot.sendMessage(chatId, `${amount} Social credit. Totaal voor ${firstName}: ${user.socialCreditScore}`)
}

function isReplyAndSticker(msg) {
  if (msg.reply_to_message) {
    if (msg.sticker) {
      if (msg.sticker.file_id == socialCreditPlus || msg.sticker.file_id == socialCreditMinus) {
        return true;
      }
    }
  }
  return false;
}

bot.onText(/\/ranking/, async function onRankingText(msg) {
  let users = await getUsers();
  users.sort((a, b) => (a.socialCreditScore > b.socialCreditScore) ? 1 : -1);
  let i = 1;
  var respondo = " ";
  for (let j = 1; j < users.length + 1; j++) {
    respondo.concat(`Op plaats ${j} staat ${users[j].firstName} met een CreditScore van ${users[j].socialCreditScore}`)
  }
  users.forEach(user => {
    //bot.sendMessage(msg.chat.id, `Op plaats ${i} staat ${user.firstName} met een CreditScore van ${user.socialCreditScore}.`)
    i++;
  });
  console.log(' respndo ', respondo)
  //bot.sendMessage(msg.chat.id, resp);
});
