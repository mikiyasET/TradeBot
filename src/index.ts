import { log } from "console";
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
                let price = require('crypto-price')
                const x: CryptoSignal | null = filter(text);
                if (x != null) {
                    binance.getPrice(x.token).then((zx) => {
                        getPrice('USD', 'ETH').then((obj: any) => { 
                            console.log(obj)
                        }).catch((err: any) => {
                            console.log(err)
                        })
                        let quantity = parseFloat(zx.toString()).toFixed(5);
                        console.log(quantity);
                    });
                    // console.log("Got a signal for ", x.token);
                    // console.log(xy); 
                    // let quantity = 10 * parseFloat(Math.round(await binance.getPrice(x.token)).toString())                    
                    // console.log(quantity);
                    
                    // if (await binance.order(x.side, x.token, quantity , x.entry.zone1)) {
                    //     bot.sendMessage(process.env.MYID, `${x.token} ${x.side} ${x.margin} ${x.leverage} ${x.entry.zone1} ${x.entry.zone2} ${x.target.one} ${x.target.two} ${x.target.three} ${x.target.four} ${x.stopLoss}`);
                    // }
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
                console.log("going through");
                // const balance = await binance.getBalance();
                // let quantity = 10 * parseFloat(Math.round(await binance.getPrice(x.token)).toString())  
                // if (await binance.order(x.side, x.token, quantity , x.entry.zone1)) {
                //     bot.sendMessage(process.env.MYID, `${x.token} ${x.side} ${x.margin} ${x.leverage} ${x.entry.zone1} ${x.entry.zone2} ${x.target.one} ${x.target.two} ${x.target.three} ${x.target.four} ${x.stopLoss}`);
                // }
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
            console.log(txt[1]);
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

const getPrice = async (base: string, token: string) => {
    let cryptoConverter = new CC()
    cryptoConverter.from("ETH").to("USDT").amount(1).convert().then((response: any) => {
        console.log(response) //or do something else
    })
}