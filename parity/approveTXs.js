var httpJson = require("http-json-request");

var id = 1;
setInterval(() => {
    httpJson.defaultHost("127.0.0.1");
    httpJson.defaultPort(8545);
    httpJson.postJSON({"method": "signer_requestsToConfirm", "params": [], "id": id, "jsonrpc": "2.0"}, (err, res) => {
        try {
            id++;
            if (res.result) {
                res.result.forEach((tx) => {
                    if (tx.payload.sendTransaction.from.toLowerCase() !== "FROM ADDRESS".toLowerCase()) {
                        return;
                    }
                    httpJson.postJSON({"method": "signer_confirmRequest", "params": [tx.id, {}, "PASSWORD"], "id": id, "jsonrpc": "2.0"}, (err2, res2) => {
                        if (err2) {
                            console.log(err2);
                        }
                        id++;
                    });
                });
            }
        } catch(e) {}
	});
}, 3000);
