const token =  "DISCORD BOT USER TOKEN";

var message, sender, msgObj;

var client = new (require("discord.js")).Client();

client.on("message", (msg) => {
    if ((msg.author.toString() === client.user.toString()) || (msg.content.substr(0, 1) !== "!")) {
        return;
    }
    message = msg.content;
    sender = msg.author.toString();
    msgObj = msg;
    module.exports.scheduler.emit("msg");
});

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
        msgObj.reply(msg);
    },

    scheduler: new (require("events"))()
};
