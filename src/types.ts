type sideType = "BUY" | "SELL" | null;
type marginType = "CROSS" | "ISOLATED" | null;
type entryType = {
    zone1: number;
    zone2: number | null;
};
type targetType= {
    one: number | null,
    two: number | null,
    three: number | null,
    four: number | null
}
type postType = 1 | 2 | 3;

type CryptoSignal = {
    token: string | null;
    side: sideType,
    margin: marginType,
    entry: entryType,
    leverage: number,
    target: targetType,
    stopLoss: number
}