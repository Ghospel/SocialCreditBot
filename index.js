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

const selfCreditMessage = "-20 omdat je jezelf credit probeert te geven."

bot.on('message', async (msg) => {
  if (isReplyAndSticker(msg)) {
    if (msg.sticker.file_id == socialCreditPlus) {
      if(isGivingSelfCredit(msg)){
        handleCredit(msg, -20, selfCreditMessage)
      } else {
        handleCredit(msg, 20);
      }
    } else if (msg.sticker.file_id == socialCreditMinus) {
      handleCredit(msg, -20);
    }
  }
});

async function handleCredit(msg, amount, customMessage) {
  const chatId = msg.chat.id;
  const firstName = msg.reply_to_message.from.first_name;
  const userId = msg.reply_to_message.from.id;

  let user = await User.getOrCreateUser(userId, firstName);
  user.addCredit(amount);
  saveUser(user);

  if(customMessage){
    bot.sendMessage(chatId, customMessage)
  }
  bot.sendMessage(chatId, `Totaal voor ${firstName}: ${user.socialCreditScore}`)
}

function isGivingSelfCredit(msg){
  if(msg.reply_to_message.from.id == msg.from.id){
    return true;
  }
  return false;
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

bot.onText(/\/ranking/, async (msg) => {
  let users = await getUsers();
  let i = 1;
  let response = " ";
  await users.forEach(user => {
    response += `#${i} ${user.firstName}. SocialScore: ${user.socialCreditScore} \n`;
    i++;
  });
  bot.sendMessage(msg.chat.id, response)
});
