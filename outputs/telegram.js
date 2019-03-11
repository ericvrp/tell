//const log = require('npmlog');
const Telegraf = require('telegraf')
const { answerCallbackQuery, Router, Markup } = Telegraf
const settings  = require('../settings/Trade-settings.js')

const os = require('os');

var bots = {};

module.exports.initBots = async function(longpolling = true) {
  settings.moonshine.outputs.map((botsettings) => {
      return module.exports.initBot(botsettings, longpolling);
  });

  return true;
}

module.exports.stopBots = async function() {
  for (var bot in bots) {
    bots[bot].stop(); // ()=>console.log(bot + ' has been stopped')
  }

  bots = {};

  return true;
}

// long polling: telegram by default does not return if there are no messages
// in the queue but waits for 30 seconds for a message to arrive. longpolling = false
// sets the wait interval to 1 second. -> handy for scripts that only run for short
// periods of time
module.exports.initBot = async function(botsettings, longpolling=true) {
  try {
    var botIds = Object.keys(bots);

    if(botIds.includes(botsettings.id)) {
      console.error('telegrambot.initBot: attempt to re-initialize the telegram bot ' + botsettings.id);
      return false;
    }

    bots[botsettings.id] = new Telegraf(botsettings.token);
    bot = bots[botsettings.id];

    bot.start((ctx) => ctx.reply('Welcome - use /help for available commands.'))

    bot.hears(['/help', '/?'], (ctx) => {
      ctx.reply('Available commands:\n\
                /help\n\
                /connect\n\
                /balances\n\
                /triggers\n\
                /settrigger <index> <key> <value>'
              );
            });

    bot.hears('/connect', (ctx) => {
      // console.log(JSON.stringify(ctx.update.message.from,0,2));
      var username = ctx.update.message.from.first_name + " " + ctx.update.message.from.last_name + ' (' +ctx.update.message.from.username + ')'
      var userid = ctx.update.message.from.id
      ctx.reply('A request has been sent to alertbot support to add ' + username + ' with user id ' + userid + ' to my contact list.');

      module.exports.sendBotMessage(botsettings.id, '<b>' +'Connect request from ' + username + ' with user id ' + userid + '</b>');
    });

    bot.hears('/balances', (ctx) => {
      ctx.reply( JSON.stringify(settings.balances,0,2) );
    });

    bot.hears('/triggers', (ctx) => {
      ctx.reply( JSON.stringify(settings.moonshine.triggers,0,2) );
    });

    bot.hears(/^\/settrigger (.+?) (.+?) (.+)/, (ctx) => {
    	let [cmd, index, key, value] = ctx.match
	index = parseInt(index,10)
    	if (!Object.keys(settings.moonshine.triggers[index]).includes(key)) {
    	  ctx.reply('trigger settings do not include ' + key)
    	  return
      }
      const oldValue = settings.moonshine.triggers[index][key]
      // console.log('typeof old value is', typeof(oldValue))
      settings.moonshine.triggers[index][key] = typeof(oldValue) === 'number' ? parseFloat(value) : value
      ctx.reply( JSON.stringify(settings.moonshine.triggers,0,2) );
    });

    bot.action('status', async (ctx) => {
      // console.log(ctx);

      var replytext = "<b>This will be added in the future!</b>"; // JSON.stringify(status);

      //var replytext = Markup.
      ctx.replyWithHTML(replytext);
      ctx.answerCbQuery();

      // ctx.editMessageText('🎉 Awesome! 🎉'))
    })

    if (longpolling) {
      bot.startPolling(); // default
    } else {
      bot.startPolling(1); // poll timeout = 1 sec
    }

    return true;
  } catch(ex) {
    console.log('failed to initialize telegram bot: ' + ex.message);
    return false;
  }
}

module.exports.getBotSettings = function(botid) {
  const settings  = require('../settings/Trade-settings.js')
  const botsettings = settings.moonshine.outputs.find((item)=>(item.id==botid));

  return botsettings;
}

module.exports.sendAllBotsMessage = function(message, showactions = true) {
  // var botIds = Object.keys(bots);
  // botIds.map((botid) => { return sendBotMessage(botid, message, showactions); });
  var botIds = Object.keys(bots);
  botIds.map((botid) => { return module.exports.sendBotMessage(botid, message, showactions); });
  return true;
}

module.exports.sendBotMessage = function(botid, message, showactions = true) {
  try {
    if(!bots[botid]) {
      console.error('telegrambot.sendBotMessage: attempt to send message using non-existent bot ' + botid);
      return false;
    }

    var options = {};
    // if(showactions) {
    //   options = Markup.inlineKeyboard([
    //     [ Markup.callbackButton('Get status', 'status')] ,
    //     //[ Markup.callbackButton('Status Demoopstelling', 'statusDemo')],
    //     //[ Markup.callbackButton('Status Bumos', 'statusBumos')]
    //    ]).oneTime()
    //   .resize()
    //   .extra({parse_mode: 'HTML',disable_web_page_preview: true});
    // } else {
      options = {reply_markup: {remove_keyboard: true}, parse_mode: 'HTML', disable_web_page_preview: true};
    // }
    // Markup.removeKeyboard(true)

    var botsettings = module.exports.getBotSettings(botid);
    if(!botsettings) {
      console.error('telegrambot.sendBotMessage: unable to access settings for ' + botid);
      return false;
    }
    for(var i=0;i<botsettings.subscribers.length;i++) {
      bots[botid].telegram.sendMessage(botsettings.subscribers[i], message, options).catch(function(error) {
        console.error('unable to send telegram message [bot probably not yet adressed by user]')
        console.error(JSON.stringify(error))
      });
    }
  } catch(ex) {
    console.error('failed to send bot message: ' + message + ' [' + ex.message + ']');
  }
}

module.exports.setBotCallbackQuery = function(action, callbackFunction) {
  try {
    if(bot==undefined) {
      log.warn('telegrambot.sendBotMessage', 'unable to set bat callback query, bot not initialized')
      return;
    }

    bot.action(action, callbackFunction);
  } catch(ex) {
    console.error('unable to set bot callbackquery: ' + ex.message + ']');
  }
}

// initBot();
