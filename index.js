const TelegramBot = require('node-telegram-bot-api');
const token = '1879933872:AAFq_UDOoFlQo7JwfwLyFPpPRoUMhsFc7J4';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', msg => {
    let Hi = 'hi';
    let Create = '/create';
    let Start = '/start';

    let userData = { login: '', pass: '' };

    if(msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
        bot.sendMessage(msg.chat.id, 'Hello!');
    }

    if(msg.text.toString().toLowerCase().indexOf(Create) === 0) {
        let req = (HttpWebRequest)(HttpWebRequest.Create('https://expensesapp2-dev-ed.lightning.force.com/lightning/o/Expense_Card__c'))
    }

    if(msg.text.toString().toLowerCase().indexOf(Start) === 0) {
        bot.sendMessage(msg.chat.id, 'Login:');
    }
})