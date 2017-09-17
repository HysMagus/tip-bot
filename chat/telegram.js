const token = "TELEGRAM TOKEN";

var bot;
var message, sender, channel, chatID;

module.exports = {
    getMsg: () => {
        return message;
    },

    getSender: () => {
        return sender;
    },
    
    connect: () => {
        bot = new (require("node-telegram-bot-api"))(token, {polling: true});
        bot.onText(/!/, (msg) => {
            chatId = msg.chat.id;
            message = msg.text;
            channel = msg.message_id;
            sender = msg.from.username;
            module.exports.scheduler.emit("msg");
        });
    },

    send: (msg) => {
        bot.sendMessage(chatId, msg, {reply_to_message_id: channel});
    },

    scheduler: new (require("events"))()
};
