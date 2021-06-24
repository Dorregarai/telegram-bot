const Telegraf = require('telegraf').Telegraf;
const bot = new Telegraf('1879933872:AAFq_UDOoFlQo7JwfwLyFPpPRoUMhsFc7J4');
const https = require('https');

const data = JSON.stringify({
    Amount__c: 100
  })

const options = {
    hostname: 'https://expensesapp2-dev-ed.lightning.force.com/services/data/v52.0/sobjects/Expense_Card__c',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }

bot.command('start', msg => {
    console.log(msg.from);
    let url = 'https://expensesapp2-dev-ed.lightning.force.com/services/data/v52.0/sobjects/Expense_Card__c/'
    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)
        
        res.on('data', d => {
            process.stdout.write(d)
        })
    })

    req.on('error', error => {
    console.error(error)
    })

    req.write(data)
    req.end()

    bot.telegram.sendMessage(msg.chat.id, 'hello there! Welcome to my new telegram bot.' + msg.from.first_name, {
    })
})






bot.launch();
//  1879933872:AAFq_UDOoFlQo7JwfwLyFPpPRoUMhsFc7J4