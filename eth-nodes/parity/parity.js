const approveTransactions = "/path/to/approveTransactions.js";
const fromAddress = "FROM ADDRESS";
const ERC20Address = "ERC20 ADDRESS";
const decimals = 18; //DECIMALS USED IN THE COIN.

require("child_process").spawn("node", [approveTransactions]);

var lastAddress, lastAmount;

var web3 = new (require("web3"))();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
var contract = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"total","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}];
contract = web3.eth.contract(contract).at(ERC20Address);

module.exports = {
    address: fromAddress,

    getLastAddress: () => {
        return lastAddress;
    },

    getLastAmount: () => {
        return lastAmount;
    },
    
    send: (to, amount, chatInterface) => {
        contract.transfer.sendTransaction(to, amount*Math.pow(10, decimals), {
            from: fromAddress,
            gasPrice: 20000000000,
            gas: 150000
        }, (err, res) => {
            chatInterface.send("Success! https://etherscan.io/tx/" + res);
            if (err) {
                console.log(err);
            }
        });
    },

    scheduler: new (require("events"))()
};

contract.Transfer().watch((err, res) => {
    if (err) {
        return;
    }
  
    var tx = res.args;
    if (tx.to.toLowerCase() !== fromAddress.toLowerCase()) {
        return;
    }

    module.exports.scheduler.emit("deposit", tx.from, Math.floor(tx.value/Math.pow(10, decimals)));
});
