const { Telegraf, WizardScene, Scenes, Stage, session } = require('telegraf');
const bot = new Telegraf('1879933872:AAFq_UDOoFlQo7JwfwLyFPpPRoUMhsFc7J4');
const jsforce = require('jsforce');
const conn = new jsforce.Connection();

conn.login('expensesapp@gmail.com', '12345678a', function(err, res) {
    if (err) {
        return console.error(err);
    }
});

const first = new Scenes.BaseScene('first');

first.enter(async ctx => {});

bot.command('start', msg => {
    let userdata = {};

    const login = new WizardScene(
        'login',
        ctx => {
            ctx.reply('Input username:');
            ctx.wizard.state.data = {};
            return ctx.wizard.next();
        },
        ctx => {
            ctx.reply('Input pass:');
            userdata.username = ctx.message.text;
            return ctx.wizard.next();
        },
        ctx => {
            userdata.password = ctx.message.text;
            return ctx.wizard.next();
        },
        ctx => {
            ctx.reply('Финальный этап: создание матча.');
            return ctx.scene.leave();
        }
    )

// Регистрируем сцену создания матча
    const stage = new Stage([login], { default: 'super-wizard' });

    const bot = new Telegraf(process.env.BOT_TOKEN);
    bot.command('start', ctx => {
        ctx.scene.enter('login');
    });
    bot.use(session());
    bot.use(stage.middleware());

    /*bot.telegram.sendMessage(msg.chat.id, 'Input username:', {})
    .then(r => {
        bot.on('text', ctx => {
            userdata.username = ctx.message.text;
            console.log(userdata)

            ctx.wizard.next()
        })
    })

    if(userdata.username){
        conn.query('SELECT Id FROM Contact WHERE Email = ' + userdata.username, function(err, res) {
            console.log(userdata)
            if (err) { return console.error(err); }
            console.log(res);
        });
    }*/

})

bot.launch();







//  1879933872:AAFq_UDOoFlQo7JwfwLyFPpPRoUMhsFc7J4