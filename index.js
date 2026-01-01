const WebSocket = require("ws");

const TOKEN = process.env.DERIV_TOKEN;
const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");

let inTrade = false;

ws.on("open", () => {
  console.log("Connected");
  ws.send(JSON.stringify({ authorize: TOKEN }));
});

ws.on("message", (msg) => {
  const data = JSON.parse(msg);

  if (data.msg_type === "authorize") {
    console.log("Authorized");
    ws.send(JSON.stringify({ ticks: "R_75", subscribe: 1 }));
  }

  if (data.msg_type === "tick" && !inTrade) {
    inTrade = true;

    ws.send(JSON.stringify({
      buy: 1,
      price: 1,
      parameters: {
        amount: 0.35,
        basis: "stake",
        contract_type: "PUT",
        currency: "USD",
        symbol: "R_75",
        duration: 1,
        duration_unit: "m"
      }
    }));
  }

  if (data.msg_type === "proposal_open_contract") {
    if (data.proposal_open_contract.profit > 0) {
      ws.send(JSON.stringify({
        sell: data.proposal_open_contract.contract_id,
        price: 0
      }));
      inTrade = false;
    }
  }
});
