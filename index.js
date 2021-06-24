const { Telegraf, session, Scenes: { BaseScene, Stage }, Markup  } = require('telegraf');
const bot = new Telegraf('1879933872:AAFq_UDOoFlQo7JwfwLyFPpPRoUMhsFc7J4');
const jsforce = require('jsforce');
const conn = new jsforce.Connection();

conn.login('expensesapp@gmail.com', '12345678a', function(err, res) {
    if (err) {
        return console.error(err);
    }
});

let userdata = {};

const usernameScene = new BaseScene('usernameScene');
usernameScene.enter(ctx => ctx.reply('Input username:'));
usernameScene.on('text', ctx => {
    return ctx.scene.enter('passwordScene', { username: ctx.message.text })
})
usernameScene.leave();

const passwordScene = new BaseScene('passwordScene');
passwordScene.enter(ctx => ctx.reply('Input password:'))
passwordScene.on('text', ctx => {
    userdata.username = ctx.scene.state.username;
    userdata.password = ctx.message.text;

    ctx.reply('User data was set');

    return ctx.scene.leave();
})
passwordScene.leave();

const stage = new Stage([ usernameScene, passwordScene ]);

bot.use(session());
bot.use(stage.middleware());
bot.command('start', ctx => ctx.scene.enter('usernameScene'));
bot.command('info', ctx => ctx.reply(userdata.username + ' ' + userdata.password))

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


bot.launch();







//  1879933872:AAFq_UDOoFlQo7JwfwLyFPpPRoUMhsFc7J4