const { Telegraf, session, Scenes: { BaseScene, Stage }, Markup  } = require('telegraf');
const Calendar = require('telegraf-calendar-telegram');
const bot = new Telegraf('1879933872:AAFq_UDOoFlQo7JwfwLyFPpPRoUMhsFc7J4');
const calendar = new Calendar(bot);
const jsforce = require('jsforce');
const conn = new jsforce.Connection();
const moment = require('moment');

let userdata = {};
let contact = { Balance__c: 0 };
let newCard = {};
let monExp = {};

conn.login('expensesapp@gmail.com', '12345678a', function(err, res) {
    if(err) return console.error(err);
});

const isLogged = () => {
    if(contact.Id) { return true } 
    else { return false }
}

const authKeyboard = Markup.keyboard([ 'Current Balance', 'Create Card' ]);
const dateKeyboard = Markup.keyboard([ 'Today', 'Calendar', 'Cancel' ]);
const checkKeyboard = Markup.keyboard([ 'Yes', 'Cancel' ]);
const removeKeyboard = Markup.removeKeyboard();

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

    return ctx.scene.enter('authScene');
})
passwordScene.leave();

const authScene = new BaseScene('authScene');
authScene.enter(ctx => {
    conn.query(
        'SELECT Id, LastName FROM Contact WHERE Email = \'' + 
        userdata.username + '\' AND Password__c = \'' + 
        userdata.password +
        '\' LIMIT 1', 
        function(err, res) {
            if(err) return console.error(err);

            if(res.records.length > 0) {
                contact.Id = res.records[0].Id;
                contact.Name = res.records[0].LastName;

                ctx.reply('Authorized successfully. Hello, ' + contact.Name + '!', authKeyboard);
            } else {
              ctx.reply('Check username and password!').then(() => ctx.scene.enter('usernameScene'));
            }
        }
    );
});
authScene.leave();

const createCard_DateScene = new BaseScene('createCard_DateScene');
createCard_DateScene.enter(ctx => {
    ctx.reply('On what date do you want create card?', dateKeyboard);
});
createCard_DateScene.leave();

const createCard_AmountScene = new BaseScene('createCard_AmountScene');
createCard_AmountScene.enter(ctx => ctx.reply('What amount of card?'));
createCard_AmountScene.on('text', ctx => {
    if(Number.isInteger(+ctx.message.text)) {
        newCard.Amount__c = ctx.message.text;
    } else {
        ctx.reply('Input valid number!').then(() => ctx.scene.enter('createCard_AmountScene'));
    }

    return ctx.scene.enter('createCard_DescScene');
});
createCard_AmountScene.leave();

const createCard_DescScene = new BaseScene('createCard_DescScene');
createCard_DescScene.enter(ctx => ctx.reply('What description of card?'));
createCard_DescScene.on('text', ctx => {
    newCard.Description__c = ctx.message.text;

    return ctx.scene.enter('createCard_CheckScene');
});
createCard_DescScene.leave();

const createCard_CheckScene = new BaseScene('createCard_CheckScene');
createCard_CheckScene.enter(ctx => {
    ctx.reply('You want to create card with the next info:').then(() => {
        ctx.reply('Date - ' + newCard.CardDate__c);
        ctx.reply('Amount - ' + newCard.Amount__c);
        ctx.reply('Description - ' + newCard.Description__c).then(() => {
            ctx.reply('Is it right?', checkKeyboard);
        });
    });
    
});
createCard_CheckScene.leave();

const stage = new Stage([ 
    usernameScene, 
    passwordScene,
    authScene, 
    createCard_DateScene, 
    createCard_AmountScene, 
    createCard_DescScene, 
    createCard_CheckScene 
]);

stage.hears('Current Balance', ctx => {
    contact.Balance__c = 0;
    if(isLogged()) {
        conn.query(
            'SELECT Balance__c FROM Monthly_Expense__c WHERE Keeper__c = \'' + 
            contact.Id + 
            '\'', 
            function(err, res) {
                if(err) return console.error(err);

                for(let elem of res.records) {
                contact.Balance__c += elem.Balance__c
                }

                ctx.reply('Your current balance = ' + contact.Balance__c + '$');
            }
        );
    } else {
        ctx.reply('Authorize first!').then(() => ctx.scene.enter('usernameScene'));
    }
});
stage.hears('Create Card', ctx => {
    if(isLogged()) {
        return ctx.scene.enter('createCard_DateScene')
    } else {
        ctx.reply('Authorize first!').then(() => ctx.scene.enter('usernameScene'));
    }
});
stage.hears('Today', ctx => { 
    if(isLogged()) {
        newCard.CardDate__c = moment(new Date).format('YYYY-MM-DD');

        ctx.reply('Selected date: ' + ctx.message.text, removeKeyboard);

        return ctx.scene.enter('createCard_AmountScene');
    } else {
        ctx.reply('Authorize first!').then(() => ctx.scene.enter('usernameScene'));
    }
});
stage.hears('Calendar', ctx => {
    if(isLogged()) {
        const today = new Date();
        const minDate = new Date();
        minDate.setMonth(today.getMonth() - 2);
        const maxDate = new Date();
        maxDate.setMonth(today.getMonth() + 2);
        maxDate.setDate(today.getDate());

        ctx.reply('Choose date', calendar.setMinDate(minDate).setMaxDate(maxDate).getCalendar())
        calendar.setDateListener((ctx, date) => { 
            newCard.CardDate__c = date;

            ctx.reply('Selected date: ' + date, removeKeyboard);

            return ctx.scene.enter('createCard_AmountScene');
        });
    } else {
        ctx.reply('Authorize first!').then(() => ctx.scene.enter('usernameScene'));
    }
});
stage.hears('Yes', ctx => {
    if(isLogged()) {
        conn.query(
            'SELECT Id FROM Monthly_Expense__c WHERE Keeper__c = \'' + 
            contact.Id + 
            '\' AND CALENDAR_MONTH(MonthDate__c) = ' +
            (+moment(newCard.CardDate__c).month() + 1) + 
            ' AND CALENDAR_YEAR(MonthDate__c) = ' +
            (+moment(newCard.CardDate__c).year()) + 
            ' LIMIT 1',
            function(err, res) {
                if(err) return console.error(err);

                for(let elem of res.records) {
                monExp.Id = elem.Id
                }

                newCard.CardKeeper__c = contact.Id;
                newCard.MonthlyExpense__c = monExp.Id;
            }
        ).then(() => {
            conn.sobject('Expense_Card__c').create(newCard, function(err, ret) {
                    if (err || !ret.success) { return console.error(err, ret); }
                    console.log("Created record id : " + ret.id);
                    if(ret.id) {
                        ctx.reply('Card created!', removeKeyboard);
                        return ctx.scene.enter('authScene');
                    }
                });
        })
    } else {
        ctx.reply('Authorize first!').then(() => ctx.scene.enter('usernameScene'));
    }
});
stage.hears('Cancel', ctx => {
    newCard = {};
    ctx.reply('Creating cancelled!', removeKeyboard);
    return ctx.scene.enter('authScene');
})



bot.use(session());
bot.use(stage.middleware());
bot.command('start', ctx => {
    newCard = {};
    contact = { Balance__c: 0 };
    userdata = {};
    monExp = {};
    return ctx.scene.enter('usernameScene', removeKeyboard);
});
bot.command('info', ctx => ctx.reply(userdata.username + ' ' + userdata.password))



bot.launch({
    webhook: {
        domain: 'https://salesforce-expenses-bot.herokuapp.com/',
        port: process.env.PORT  
    }
});