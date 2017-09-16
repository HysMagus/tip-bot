const config = {
    user: {
        nick: "IRC NICK",
        user: "IRC NICK",
        real: "HOST USERNAME",
    },
    server: {
        addr: "IRC SERVER ADDRESS",
        port: 6667
    }
};

var message, sender, lastChannel;

var net = require("net");

var ircSock = new net.Socket();

ircSock.on("data", (data) => {
    if (data.substr(0, 6) === "PING :") {
        ircSock.write("PONG :" + data.split(":")[1] + "\r\n");
        return;
    }
    
    if (data.includes(" PRIVMSG #")) {
        if (data.split("PRIVMSG #")[1].split(":")[1].substr(0, 1) === "!") {
            message = data.split("PRIVMSG #")[1].split(":")[1];
            sender = data.substr(1, data.indexOf("!") - 1);
            lastChannel = data.split("PRIVMSG #")[1].split(" :")[0];
            module.exports.scheduler.emit("msg");
        }
    }
});

ircSock.on("connect", () => {
    setTimeout(() => {
        ircSock.write("NICK " + config.user.nick + "\r\n");
        ircSock.write("USER " + config.user.user + " 8 * :" + config.user.real + "\r\n");
    }, 1000);
});

ircSock.setEncoding("utf-8");
ircSock.setNoDelay();

module.exports = {
    getMsg: () => {
        return message;
    },

    getSender: () => {
        return sender;
    },
    
    connect: () => {
        ircSock.connect(config.server.port, config.server.addr);
    },

    send: (msg) => {
        ircSock.write("PRIVMSG #" + lastChannel + " :" + msg + "\r\n");
    },

    scheduler: new (require("events"))()
};
