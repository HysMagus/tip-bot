const toConnect = [
    "channelID1",
    "channelID2"
];
const token = "GITTER TOKEN";

var message, sender, lastRoom;

String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

module.exports = {
    getMsg: () => {
        return message;
    },

    getSender: () => {
        return sender;
    },
    
    connect: () => {
        var gitter = require("node-gitter");
        gitter = new gitter(token);
        for (var i = 0; i < toConnect.length; i++) {
            gitter.rooms.find(toConnect[i]).then((room) => {
                var events = room.streaming().chatMessages();
                events.on("chatMessages", (msg) => {
                    try {
                        var text = "" + msg.model.text;
                        if (text.substr(0, 1) !== "!") {
                            return;
                        }
                        lastRoom = room;
                        message = text.replaceAll("@", "");
                        sender = msg.model.fromUser.username;
                        module.exports.scheduler.emit("msg");
                    } catch(e){}
                });
            });
        }
    },

    send: (msg) => {
        lastRoom.send(msg);
    },

    scheduler: new (require("events"))()
};
