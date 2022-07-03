import { log } from "console";

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
        return this.binance.futuresBalance().then((res: any) => {
            let balance = 0;
            res.map((x: any) => {
                if (x.asset == "USDT") {
                    balance = x.balance;
                }
            })
            return balance;
        });
    }

    public async order(side: string, token: string, quantity: number, price: number, stopPrice: number = 0,takePrice: number = 0) {
        if (side === 'BUY') {
            return this.binance.futuresBuy(
                 token,
                 quantity,
                 price,
                 {
                    timeInForce: 'GTC',
                    stopPrice: stopPrice,
                    type: "STOP_LOSS_LIMIT"
                }
            ).then((res:any) => {
                console.log("Success: ",res);
                return true;
            }).catch((err:any) => {
                console.log("Error: ",err);
                return false;
            })
        }else if (side == 'SELL') {
            this.binance.futuresSell(token,quantity,price,
                {
                    timeInForce: 'GTC',
                    stopPrice: stopPrice,
                    type: "STOP_LOSS_LIMIT"
                })
        }else {
            return this.binance.futuresSell(
                token,
                quantity,
                price,
                {
                    timeInForce: 'GTC',
                    type: "TAKE_PROFIT_MARKET"
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

    public async getinfo(token: string): Promise<{status: boolean, quantityPrecision: number}> {
        return await this.binance.futuresExchangeInfo()
        .then(async (info:any) => {
             let m;
             info['symbols'].forEach((element:any) => {
                if(element.symbol === token) {
                    m = {
                        status: true,
                        quantityPrecision: element.quantityPrecision
                    };
                }   
            });
            // console.log(m);
            
            return m;
        }).catch((e:any) => {
            return {
                status: false,
                quantityPrecision: 0
            }
        });
    }

    public async OG(side: string,token: string,price: number,quantity: number,stop: number,profit: any) {
        const sideRev = side === "SELL" ? "Buy" : "Sell";
        const orders = [
            {
                symbol: token,
                type: "LIMIT",
                side: side,
                price: price.toString(),
                quantity: quantity.toString(),
                timeInForce: 'GTC',
            },{
                symbol: token,
                type: 'TAKE_PROFIT_MARKET',
                quantity: quantity.toString(),
                side: sideRev,
                stopPrice: profit.four.toString() ?? profit.three.toString() ?? profit.two.toString() ?? profit.one.toString() ?? "0",
                timeInForce: 'GTC',
                closePosition: 'True'
            },
            {
                symbol: token,
                type: 'STOP_MARKET',
                quantity: quantity.toString(),
                side: sideRev,
                stopPrice: stop.toString(),
                timeInForce: 'GTC',
                closePosition: 'True'
            }
        ]
        return await this.binance.futuresMultipleOrders(orders);
    }
}