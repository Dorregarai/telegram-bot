const Telegraf = require('telegraf').Telegraf;
const bot = new Telegraf('1879933872:AAFq_UDOoFlQo7JwfwLyFPpPRoUMhsFc7J4');
const request = require('request');

bot.command('start', msg => {
    console.log(msg.from);
    request('https://expensesapp2-dev-ed.lightning.force.com', (err, res, body) => {
        if(err) {
            console.log(err)
        } else {
            console.log(body);
        }
    })
    bot.telegram.sendMessage(msg.chat.id, 'hello there! Welcome to my new telegram bot.' + msg.from.first_name, {
    })
})






bot.launch();
//  1879933872:AAFq_UDOoFlQo7JwfwLyFPpPRoUMhsFc7J4