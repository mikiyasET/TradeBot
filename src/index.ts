require('dotenv').config()
import './types'
const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});
let preMSG = "";

bot.on('channel_post', async (msg: {message_id: any, text: any,chat: any;}) => {
    const {text} = msg;
    if (text != preMSG) {
        if (text.indexOf('test mode') !== -1) {
            console.log("Test Mode")
        }else {
            const x: CryptoSignal = filter(text);
            console.log(x);
        }
        preMSG = text;
    }
})


const filter = (text: string) => {

    text = text.replace('Entry zone:','').replace('Entry:','').replace("Leverage:", "").replace('🔴','').replace('🟢','');

    let msg: string[] = text.split('\n');
    let side: sideType = null;
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
    let stopLoss:number;

    let txt: string[] = [];
    msg.map((x) => {
     txt.push(x.trim())
    });
    if (txt[0] == "LONG") {
     side = "BUY";
    }else if (txt[0] == "SHORT") {
     side = "SELL";
    }
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

    return {
        token: token,
        side: side,
        margin: margin,
        entry: entry,
        leverage: leverage,
        target: target,
        stopLoss: stopLoss
    };
}