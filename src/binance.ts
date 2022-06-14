require('dotenv').config()
const BinanceRest = require('node-binance-api');
export class Binance {
    private _apiKey: string = process.env.BINANCE_API_KEY as string;
    private _apiSecret: string = process.env.BINANCE_API_SECRET as string;
    private binance = new BinanceRest().options({
        APIKEY: this._apiKey,
        APISECRET: this._apiSecret,
        test: true
    });

    public async getBalance() {
        return await this.binance.futuresBalance().then((res:any) => {
            let balance = 0;
            res.balances.map((x: any) => {
                if (x.asset == "USDT") {
                    balance = x.balance();
                }
            })
            return balance;
        });
    }

    public async order(side: string, token: string, quantity: number, price: number) {
        return await this.binance.futuresOrder({
            symbol: token,
            side: side,
            quantity: quantity,
            price: price
        }).then((res:any) => {
            return true;
        }).catch((err:any) => {
            return false;
        })
    }

    public async cancelOrder(symbol: string) {
        return  await this.binance.cancelAll(symbol).then((res:any) => {
            return true;
        }).catch((err:any) => {
            return false;
        })
    }
}