const chatInterface = require("./INSERT_CHAT_FILE.js");
const db = require("./INSERT_DB_FILE.js");
const ethNode = require("./INSERT_ETH_NODE_FILE.js");
const tokenSymbol = "TOKEN SYMBOL";
const hostUsername = "YOUR USERNAME";
const withdrawFee = 1; //Withdraw fee in tokens.

var boot = Date.now();

chatInterface.connect();

var commands = [
    "!deposit",
    "!tip",
    "!withdraw",
    "!balance",
    "!help"
];

var accounts = {}, balances = {}, last = {}, lastHelp = 0;

setInterval(() => {
    balances = db.getBalances();
}, 60000);

function check(sender, spaceData) {
    db.createIfNull(sender);
    if (typeof(balances[sender]) !== "number") {
        db.addNotify(sender);
        return true;
    }
    if (db.notify(sender)) {
        chatInterface.send("By using this bot you do not hold the maker liable for ANYTHING, including financial loss. You also agree that you understand the statements in \"!help.\"\r\nAlso, it should be noted, your last command must be run again to work.");
        last[sender] = 0;
        return true;
    }
    if (typeof(last[sender]) === "number") {
        if (Date.now() < last[sender] + 61000) {
            chatInterface.send("Please wait a minute before using the bot again.");
            return true;
        }
    }
    if ((spaceData.message.split(" ").length - 1) < spaceData.desired) {
        chatInterface.send("You didn't include the right amount of arguments.");
        return true;
    }
    last[sender] = Date.now();
    return false;
}

function parseMessage() {
    if (Date.now() - boot < 70*1000) {
        chatInterface.send("Please give me " + Math.round((70000 - (Date.now() - boot)) / 1000) + " seconds to boot.");
        return;
    }
    boot = 0;

    var message = chatInterface.getMsg();
    message = message.split(" ");
    message = message.filter((item, index, inputArray) => {
       return item !== "";
    });
    message = message.join(" ");

    var sender = chatInterface.getSender();
    
    for (var i = 0; i < commands.length; i++) {
        if (message.substr(0, commands[i].length) === commands[i]) {
            switch(i) {
                case 0: //Deposit
                    if (check(sender, {message: message, desired: 1})) {
                        break;
                    }

                    var breakOut;
                    for (var a in accounts) {
                        if (accounts[a].address == message.split(" ")[1].split("\r")[0].split("\n")[0].split(" ")[0]) {
                            chatInterface.send("That address is already in use.");
                            breakOut = true;
                            break;
                        }
                        if ((accounts[a].time + (65*60*1000)) < Date.now()) {
                            delete accounts[a];
                        }
                    }
                    if (breakOut) {
                        break;
                    }
                    accounts[sender] = {address: message.split(" ")[1].split("\r")[0].split("\n")[0].split(" ")[0].toLowerCase(), time: Date.now()};
                    chatInterface.send("Send to " + ethNode.address + " within an hour.");
                    break;
                
                case 1: //Tip
                    if (check(sender, {message: message, desired: 2})) {
                        break;
                    }

                    if (Number.isNaN(parseInt(message.split(" ")[2]))) {
                        chatInterface.send("You didn't enter a number.");
                        break;
                    }
                    
                    if ((balances[sender] - parseInt(message.split(" ")[2])) < 0) {
                        chatInterface.send("You don't have enough money to tip that. You have " + balances[sender] + " " +  tokenSymbol + ".");
                    } else if(0 > parseInt(message.split(" ")[2])) { 
                        chatInterface.send("You can only tip positive amounts. Don't be a thief.");
                    } else {
                        db.subFunds(sender, parseInt(message.split(" ")[2]));
                        db.createIfNull(message.split(" ")[1], {op: "add", who: message.split(" ")[1], amount: parseInt(message.split(" ")[2])});
                        chatInterface.send("Sent " + message.split(" ")[1] + ", " + message.split(" ")[2] + " " +  tokenSymbol + ".");
                    }
                    break;
                    
                case 2: //Withdraw
                    if (check(sender, {message: message, desired: 1})) {
                           break;
                    }
                    
                    if (balances[sender] === 0) {
                        chatInterface.send("You have nothing to withdraw.");
                    }
                    
                    var toSend;
                    if (message.split(" ")[2] === "all") {
                        toSend = balances[sender];
                    } else {
                        toSend = parseInt(message.split(" ")[2]);
                        if (Number.isNaN(toSend)) {
                            chatInterface.send("You didn't enter a whole number.");
                            break;
                        }
                    }
                    
                    if ((db.getWithdraws(sender) === 0) && (message.split(" ")[2] === "all")) {
                        toSend -= 1;
                    }
                    if (((balances[sender] - toSend) < 20) && (db.getWithdraws(sender) === 0)) {
                        chatInterface.send("You don't have enough money to withdraw that. You have: " + balances[sender] + " " +  tokenSymbol + " and you must leave " +  withdrawFee + " " +  tokenSymbol + " to pay for gas.");
                        break;
                    } else if (0 > toSend) { 
                        chatInterface.send("You can only withdraw positive amounts. Don't be a thief.");
                        break;
                    } else if (toSend === 0) {
                        chatInterface.send("You can't withdraw 0 " +  tokenSymbol + ".");
                    }
                    
                    db.subFunds(sender, toSend + 20);
                    db.addFunds(hostUsername, withdrawfee);
                    ethNode.send(message.split(" ")[1], toSend, chatInterface);
                    break;
                    
                case 3: //Balance
                    db.createIfNull(sender);
                    if (db.notify(sender) == true) {
                        chatInterface.send("By using this bot you do not hold the maker liable for ANYTHING, including financial loss. You also agree that you understand the statements in \"!help\". By running another command, you agree to these terms and conditions.");
                        break;
                    }
                    if (balances[sender]) {
                        chatInterface.send("You have " + balances[sender] + "" +  tokenSymbol + ". Please note it can take up to a minute to update.");
                    } else {
                        chatInterface.send("You have 0 " +  tokenSymbol + ". Please note it can take up to a minute to update.");
                    }
                    break;
                    
                case 4: //Help
                    if (Date.now() > (lastHelp + 10*60*1000)) {
                        chatInterface.send("Commands:\r\n" +
                            "-- !deposit FROM_ADDRESS\r\n" +
                            "-- !tip AT_MENTION_OF_USER amount\r\n" +
                            "-- !withdraw TO_ADDRESS amount\r\n" +
                            "-- !balance\r\n" + 
                            "Withdrawls cost " +  withdeawFee + " " +  tokenSymbol + ". No decimal numbers are allowed.\r\n" +
                            "This is hosted by " +  hostUsername + " who is not part of the group behind " +  tokenSymbol + ".");
                        lastHelp = Date.now();
                    }
                    break;
                default:
                    chatInterface.send("That is not a command. Try \"!help\"");
            }
        }
    }
}
chatInterface.scheduler.on("msg", parseMessage);


function handleDeposit(depositer, amount) {
    for (var a in accounts) {
        if (accounts[a].address !== depositer) {
            continue;
        }
        delete accounts[a];
        balances[a] += amount;
        db.addFunds(a, amount);
        break;
    }
}
ethNode.scheduler.on("deposit", handleDeposit);
