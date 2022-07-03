
import {Binance} from "./binance";

var CC = require("crypto-converter-lt")
require('dotenv').config()
import './types'
const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});
let preMSG = "";
const binance = new Binance();

bot.on('message', async (msg: {chat: any,text: any}) => {
    const balance = await binance.getBalance();
    const chatId = msg.chat.id;
    const text = msg.text;
    try {
        if(text.indexOf("/balance") !== -1){
            bot.sendMessage(chatId, "Your balance is " + balance + " USDT")
        }else {
            if (text.indexOf('test mode') !== -1) {
                console.log("Test Mode")
            }else {
                const x: CryptoSignal | null = filter(text);
                if (x != null) {
                    binance.getPrice(x.token).then((zx) => {
                        let quantity = parseFloat(zx.toString()).toFixed(5);
                        let betInUSD = 25;
                        let amount = getAmount(parseFloat(quantity),betInUSD);
                        binance.getinfo(x.token).then(({status,quantityPrecision}) => {
                            if(status) {
                                let price = 0;
                                amount = parseFloat(amount.toFixed(quantityPrecision));
                                if (x.side == "BUY") {
                                     //       47      >    45
                                    if (x.entry.zone1 > parseFloat(quantity)) {
                                        price = parseFloat(quantity) 
                                    }else {
                                        price = x.entry.zone1
                                    }
                                }else {
                                    if (x.entry.zone1 < parseFloat(quantity)) {
                                        price = parseFloat(quantity)
                                    }else {
                                        price = x.entry.zone1
                                    }
                                }
                                binance.OG(x.side,x.token,x.entry.zone1,amount,x.stopLoss,x.target).then((xe:any) => {
                                    bot.sendMessage(process.env.MYID, `${x.token} ${x.side}\n${x.margin} ${x.leverage}\n${x.entry.zone1} - ${x.entry.zone2}\n${x.target.one}\n${x.target.two}\n${x.target.three}\n${x.target.four}\n${x.stopLoss}\n\n Order placed`);
                                }).catch((e) => {
                                    bot.sendMessage(process.env.MYID, "Ordering failed.");
                                })
                            }else {
                                console.log("Status: ",status);
                            }
                        }).catch((err) => {
                            console.log(err);
                        })
                    });
                }
            }
            
        }
    }catch (e) {
        
    }
})

bot.on('channel_post', async (msg: {message_id: any, text: any,chat: any;}) => {
    const {text} = msg;
    if (text != preMSG) {
        if (text.indexOf('test mode') !== -1) {
            console.log("Test Mode")
        }else {
            const x: CryptoSignal | null = filter(text);
            if (x != null) {
                binance.getPrice(x.token).then((zx) => {
                    let quantity = parseFloat(zx.toString()).toFixed(5);
                    let betInUSD = 25;
                    let amount = getAmount(parseFloat(quantity),betInUSD);
                    binance.getinfo(x.token).then(({status,quantityPrecision}) => {
                        if(status === true) {
                            let price = 0;
                            amount = parseFloat(amount.toFixed(quantityPrecision));
                            if (x.side == "BUY") {
                                 //       47      >    45
                                if (x.entry.zone1 > parseFloat(quantity)) {
                                    price = parseFloat(quantity) 
                                }else {
                                    price = x.entry.zone1
                                }
                            }else {
                                if (x.entry.zone1 < parseFloat(quantity)) {
                                    price = parseFloat(quantity)
                                }else {
                                    price = x.entry.zone1
                                }
                            }
                            binance.OG(x.side,x.token,x.entry.zone1,amount,x.stopLoss,x.target).then((xe:any) => {
                                bot.sendMessage(process.env.MYID, `${x.token} ${x.side}\n${x.margin} ${x.leverage}\n${x.entry.zone1} - ${x.entry.zone2}\n${x.target.one}\n${x.target.two}\n${x.target.three}\n${x.target.four}\n${x.stopLoss}\n\n Order placed`);
                            }).catch((e) => {
                                bot.sendMessage(process.env.MYID, "Ordering failed.");
                            })
                        }else {
                            console.log("Status: ",status);
                        }
                    }).catch((err) => {
                        console.log(err);
                    })
                });
            }
        }
        preMSG = text;
    }
})


const filter = (text: string) => {

    text = text.replace('Entry zone:','').replace('Entry:','').replace("Leverage:", "").replace('🔴','').replace('🟢','');
    let postType: 1 | 2 | 3 | 4 = 1;
    let msg: string[] = text.split('\n');
    let side: sideType;
    let margin: marginType;
    let token: string | null;
    let entry: entryType = {
     zone1: 0,
     zone2: null
    };
    let leverage: number;
    let target: targetType = {
     one: null,
     two: null,
     three: null,
     four: null
    };
    let stopLoss:number | null;

    let txt: string[] = [];
    msg.map((x) => {
     txt.push(x.trim())
    });
    if (txt.length == 9) {
        if (txt[0] == "LONG") {
            side = "BUY";
        }else if (txt[0] == "SHORT") {
            side = "SELL";
        }else {
            side = "BUY";
            postType = 4;
        }
        if (postType == 1) {
            // console.log(txt[1]);
            token = txt[1].split(" ")[0].trim();
            margin = txt[2].split(" ")[0].trim() as marginType;
            leverage = parseInt(txt[2].split(" ")[1].trim().replace("x", ""));
            if(txt[3].indexOf("-") !== -1){
            entry.zone1 = parseFloat(txt[3].split("-")[0].trim());
            entry.zone2 = parseFloat(txt[3].split("-")[1].trim());
            }else {
                entry.zone1 = parseFloat(txt[3].trim());
                entry.zone2 = null;
            }
            target.one = parseFloat(txt[4].split(":")[1].trim());
            target.two = parseFloat(txt[5].split(":")[1].trim());
            target.three = parseFloat(txt[6].split(":")[1].trim());
            target.four = parseFloat(txt[7].split(":")[1].trim());
            stopLoss = parseFloat(txt[8].split(":")[1].trim());
            console.log("Passed.");
            
            return {
                token: token,
                side: side,
                margin: margin,
                entry: entry,
                leverage: leverage,
                target: target,
                stopLoss: stopLoss
            };
        }else {
            console.log("Not Trade msg");
        }
    }else {
        console.log("Not a valid format");
    }
    return null;
}

const getAmount = (tokenPrice: number,usdt: number) => {
    console.log(usdt)
    const price = usdt / parseFloat(tokenPrice.toFixed(2));
    console.log("Price: ",price);
    return truncateToDecimals(price,5)
        
}
function truncateToDecimals(num: number, dec:number):number {
    const calcDec = Math.pow(10, dec);
    return Math.trunc(num * calcDec) / calcDec;
}

/*
app.get('/', (req:any, res:any) => {
    res.send('Hello World!');
})
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started");
})*/
