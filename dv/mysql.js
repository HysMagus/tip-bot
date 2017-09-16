const table = "tableName";
const connection = require("mysql").createConnection({
    host: "localhost",
    user: "USER",
    password: "PASS",
    database: "DB"
});

var balances = {}, notify = {}, withdraws = {}, isAddingNew;

function update() {
    connection.query("SELECT * FROM " + table, (err, rows) => {
        if (err) {
            console.log(err);
        }
    
        rows.forEach((row) => {
            balances[row.name] = row.balance;
            notify[row.name] = row.notify;
            withdraws[row.name] = row.withdraws;
        });
    });
}

connection.connect((err) => {
    if (err) {
        console.log(err);
        process.exit(-2);
    }
    update();
});

function genUser(user, second) {
    //{name: "", balance: 0, withdraws: 0, notify: false};
    balances[user] = 0;
    notify[user] = true;
    connection.query("INSERT INTO " + table + " SET ?", {name: user, balance: 0, withdraws: 0, notify: true}, (err, res) => {
        if (err) {
            console.log(err);
        }
        if (second) {
            connection.query("SELECT * FROM " + table, (err, rows) => {
                if (err) {
                    console.log(err);
                }
                rows.forEach((row) => { 
                    if (row.name === second.who) {
                        var amount;
                        if (second.op === "add") {
                            amount = row.balance + second.amount;
                        } else if (second.op === "sub") {
                            amount = row.balance - second.amount;
                        }
                        connection.query("UPDATE " + table + " SET balance = ? WHERE name = \"" + second.who + "\"", amount, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                });
            });
        }
    });
}

module.exports = {
    setWithdraws: (sender, number) => {
        connection.query("UPDATE " + table + " SET withdraws = ? WHERE name = \"" + sender + "\"", number, (err) => {
            if (err) {
                console.log(err);
            }
        });
    },
    
    getWithdraws: (sender) => {
        return withdraws[sender];
    },
    
    notify: (user) => {
        var answer = notify[user];
        delete notify[user];
        connection.query("UPDATE " + table + " SET notify = false WHERE name = \"" + user + "\"", (err) => {
            if (err) {
                console.log(err);
            }
        });
        return answer;
    },

    addNotify: (user) => {
        notify[user] = true;
    },
    
    getBalances: () => {
        return balances;
    },
    
    createIfNull: (user, second)  => {
        connection.query("SELECT * FROM " + table, (err, rows) => {
            if (err) {
                console.log(err);
            }
            
            var found = false;
            rows.forEach((row) => { 
                if (row.name === user) {
                    found = true;
                }
            });
            
            if (!found) {
                genUser(user, second);
            } else if (second) {
                rows.forEach((row) => { 
                    if (row.name === second.who) {
                        var amount;
                        if (second.op === "add") {
                            amount = row.balance + second.amount;
                        } else if (second.op === "sub") {
                            amount = row.balance - second.amount;
                        }
                        connection.query("UPDATE " + table + " SET balance = ? WHERE name = \"" + second.who + "\"", amount, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                });
                connection.query("SELECT * FROM " + table, (err, rows) => {
                    if (err) {
                        console.log(err);
                    }
        
                    rows.forEach((row) => {
                        balances[row.name] = row.balance;
                        notify[row.name] = row.notify;
                    });
                });
            }
        });
    },
    
    addFunds: (user, amount) => {
        if (isAddingNew) {
            setTimeout(module.exports.addFunds, 1000, user, amount);
        }
        connection.query("SELECT * FROM " + table, (err, rows) => {
            if (err) {
                console.log(err);
            }
            
            rows.forEach((row) => { 
                if (row.name === user) {
                    connection.query("UPDATE " + table + " SET balance = ? WHERE name = \"" + user + "\"", (row.balance + amount), (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        });
    },
    
    subFunds: (user, amount) => {
        if (isAddingNew) {
            setTimeout(module.exports.subFunds, 1000, user, amount);
        }
        connection.query("SELECT * FROM " + table, (err, rows) => {
            if (err) {
                console.log(err);
            }
            
            rows.forEach((row) => { 
                if (row.name === user) {
                    connection.query("UPDATE " + table + " SET balance = ? WHERE name = \"" + user + "\"", (row.balance - amount), (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        });
    },
    
    balance: (user) => {
        connection.query("SELECT * FROM " + table, (err, rows) => {
            if (err) {
                console.log(err);
            }
        
            rows.forEach((row) => { 
                if (row.name === user) {
                    balances[user] = row.balance;
                    return;
                }
            });
            balances[user] = false;
        });
    }
};

setInterval(update, 60000);
