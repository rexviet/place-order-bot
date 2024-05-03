import { IExchange } from '.';
import { HttpClientResponse, IHttpClient } from '../../utils/httpClient';
import { BitGetStatusCode } from '../enum/bitgetStatusCode';
import { IOrderDetail } from '../orderDetail';
import * as crypto from 'crypto';

export class BitGetExchange implements IExchange {
  private readonly defaultLeverage = 10;

  constructor(
    private readonly httpClient: IHttpClient,
    private readonly apiKey: string,
    private readonly secretKey: string,
    private readonly passphrase: string,
    private readonly marginCoin: string,
    private readonly productType: string,
    private readonly riskRatio: number,
    private readonly fundPerPosition: number,
  ) {}

  private genSignature(
    timestamp: number,
    method: string,
    requestPath: string,
    body: string,
  ): string {
    const data = `${timestamp}${method}${requestPath}${body}`;
    // console.log('data to sign:', data);
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('base64');
  }

  private async callApi(
    requestPath: string,
    body: any,
  ): Promise<HttpClientResponse<any>> {
    const timestamp = Math.round(Date.now());

    const sign = this.genSignature(
      timestamp,
      'POST',
      requestPath,
      JSON.stringify(body),
    );

    return this.httpClient.post({
      path: requestPath,
      headers: {
        'ACCESS-KEY': this.apiKey,
        'ACCESS-SIGN': sign,
        'ACCESS-PASSPHRASE': this.passphrase,
        'ACCESS-TIMESTAMP': timestamp,
      },
      body,
    });
  }

  private async setLeverage(symbol: string, leverage: string): Promise<number> {
    const setLeverageRs = await this.callApi(
      '/api/v2/mix/account/set-leverage',
      {
        symbol,
        productType: this.productType,
        marginCoin: this.marginCoin,
        leverage,
      },
    );

    switch (setLeverageRs.body.code) {
      case BitGetStatusCode.MAX_LEVERAGE:
        await this.callApi(
          '/api/v2/mix/account/set-leverage',
          {
            symbol,
            productType: this.productType,
            marginCoin: this.marginCoin,
            leverage: this.defaultLeverage.toString(),
          },
        );
        return this.defaultLeverage;
      case BitGetStatusCode.SUCCESS:
        return Number(leverage);
      default:
        throw new Error(setLeverageRs.body.msg);
    }
  }

  public async placeOrder(orderDetail: IOrderDetail): Promise<IOrderDetail> {
    const symbol = `${orderDetail.symbol}${this.marginCoin}`;
    let leverage = Math.floor(this.riskRatio / Number(orderDetail.risk));
    const size = leverage * this.fundPerPosition / Number(orderDetail.entryPrice);

    leverage = await this.setLeverage(symbol, leverage.toString());
    const placeOrderData = {
      symbol,
      productType: this.productType,
      marginMode: 'crossed',
      marginCoin: this.marginCoin,
      size: size.toString(),
      price: orderDetail.entryPrice,
      side: orderDetail.direction.toLowerCase(),
      presetStopSurplusPrice: orderDetail.tpPrice,
      presetStopLossPrice: orderDetail.slPrice,
      orderType: 'limit',
      tradeSide: 'open',
    };
    console.log('placeOrderData:', placeOrderData);
    const placeOrderRs = await this.callApi('/api/v2/mix/order/place-order', placeOrderData);
    console.log('placeOrderRs:', placeOrderRs.body);
    if (placeOrderRs.body.code !== BitGetStatusCode.SUCCESS) {
      throw new Error(placeOrderRs.body.msg);
    }
    return {
      ...orderDetail,
      leverage: leverage.toString(),
    };
  }
}
