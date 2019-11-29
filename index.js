import User from './user';
import {
  saveUser,
  getUsers,
} from './db'
import {
  checkFilters,
  toBeDecided,
  minCreditFilter,
  plusCreditFilter,
  pushToFilter
 } from './filter';


const TelegramBot = require('node-telegram-bot-api');
const options = {
  polling: true
};

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, options);
const socialCreditPlus = 'CAADAQADAgADf3BGHAXMZNg3IivIFgQ';
const socialCreditMinus = 'CAADAQADAwADf3BGHENZiEtY50bNFgQ';

const selfCreditMessage = "-20 omdat je jezelf credit probeert te geven."



function updateArray (array) {
    array.forEach(string => {
        if (typeof string === 'string') {
            string.toLowerCase();
        } else { 
            return;
        }
    })
}

bot.on('message', async (msg) => {
  console.log(msg.chat.id)
//  if(msg.chat.id == -379248839 || msg.chat.id == 848122263){
  checkFilters(msg);
  checkMinFilter(msg);
  checkPlusFilter(msg);
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
//  }
});

async function handleCredit(msg, amount, customMessage) {
  const chatId = msg.chat.id;
  let firstName;
  let userId;
  if (msg.reply_to_message) {
    firstName = msg.reply_to_message.from.first_name;
    userId = msg.reply_to_message.from.id;
  } else {
    firstName = msg.from.first_name;
    userId = msg.from.id;
  }

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

bot.onText(/\/filters/, async (msg) => {
  sendTBD(msg);
});

bot.onText(/\/filter/, async (msg) => {
  sendTBDFirstIndex();
});

bot.onText(/\/min/, async (msg) => {
  pushToFilter(msg);
  bot.sendMessage(-358918753, 'pushed naar min');
});

bot.onText(/\/plus/, async (msg) => {
  pushToFilter(msg);
  bot.sendMessage(-358918753, 'pushed naar plus');
});

bot.onText(/\/boeie/, async (msg) => {
  pushToFilter(msg);
  bot.sendMessage(-358918753, 'pushed naar boeie');
});

function sendTBD(msg) {
  toBeDecided.forEach(flaggedMsg => {
      bot.sendMessage(msg.chat.id, '"' + flaggedMsg + '"' + ' is een flagged message mag dit?');
  });
}

function sendTBDFirstIndex() {
  bot.sendMessage(-358918753, '"' + toBeDecided[0] + '"' + ' is een flagged message mag dit?')
}

function checkMinFilter(msg) {
  minCreditFilter.forEach(string => {
    if (msg.text) {
      const correctedString = string.toLowerCase();
      const correctedMsg = msg.text.toString().toLowerCase();
      const match = correctedMsg.includes(correctedString);
      if (match) {
        handleCredit(msg, -100);
        bot.sendMessage(msg.chat.id, "mag nie van de regering -100")
      }
    }
  });
}

function checkPlusFilter(msg) {
  plusCreditFilter.forEach(string => {
    if (msg.text) {
      const correctedString = string.toLowerCase();
      const correctedMsg = msg.text.toString().toLowerCase();
      const match = correctedMsg.includes(correctedString);
      if (match) {
        bot.sendMessage(msg.chat.id, "lekke bezig vind mark leuk +100", {reply_to_message_id: msg.chat.id})
        handleCredit(msg, 100);
      }
    }
  });
}