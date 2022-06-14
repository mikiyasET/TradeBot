require('dotenv').config()
const BinanceRest = require('node-binance-api');
export class Binance {
    private _apiKey: string = process.env.BINANCE_API_KEY as string;
    private _apiSecret: string = process.env.BINANCE_API_SECRET as string;
    private binance: any;

    constructor() {
        this.binance = new BinanceRest().options({
            APIKEY: this._apiKey,
            APISECRET: this._apiSecret,
            test: true,
            useServerTime: true
        });
        
        console.log("Done");
    }

    public async getBalance() {
        return await this.binance.futuresBalance().then((res:any) => {
            let balance = 0;
            console.log(res);
            res.map((x: any) => {
                if (x.asset == "USDT") {
                    balance = x.balance;
                }
            })
            return balance;
        });
    }

    public async order(side: string, token: string, quantity: number, price: number) {
        if (side === 'BUY') {
            return await this.binance.futuresBuy(
                 token,
                 quantity,
                 price,
                 {
                     timeInForce: 'GTC'
                 }
            ).then((res:any) => {
                console.log("Success: ",res);
                return true;
            }).catch((err:any) => {
                console.log("Error: ",err);
                return false;
            })
        }else {
            console.log(token);
            return await this.binance.futuresSell(
                token,
                quantity,
                price,
                {
                    timeInForce: 'GTC'
                }
            ).then((res:any) => {
                console.log("Success: ",res);
                return true;
            }).catch((err:any) => {
                console.log("Error: ",err);
                return false;
            })
        }
    }

    public async cancelOrder(symbol: string) {
        return  await this.binance.cancelAll(symbol).then((res:any) => {
            return true;
        }).catch((err:any) => {
            return false;
        })
    }

    public async getPrice(symbol: string) {
        let ticker = await this.binance.prices();
        return ticker[symbol];
    }
}