//NOT WORKING

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
        client.login(token);
    },

    send: (msg) => {
        bot = new require("node-telegram-bot-api")(token, {polling: true});
        bot.onText(/!/, (msg) => {
            chatId = msg.chat.id;
            message = msg.text;
            channel = msg.message_id;
            sender = 
            module.exports.scheduler.emit("msg");
        });
    },

    scheduler: new (require("events"))()
};
