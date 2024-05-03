import { ITelegramMessage, IMessageParams } from '../params';
import { ParserType } from '/opt/nodejs/common/enum';
import { IExchange } from '/opt/nodejs/common/exchanges';
import { ignoreTexts } from '/opt/nodejs/common/ignoreTexts';
import { IOrderParser, ParserFactory } from '/opt/nodejs/common/order-parsers';
import { IHttpClient } from '/opt/nodejs/utils/httpClient';

export interface IBotReceiveMessageUS {
  execute(data: IMessageParams): Promise<void>;
}

export class BotReceiveMessageUSImpl implements IBotReceiveMessageUS {
  constructor(
    private readonly orderParserFactory: ParserFactory,
    private readonly exchange: IExchange,
    private readonly httpClient: IHttpClient,
    private readonly botKey: string,
  ) {}

  public async execute(data: IMessageParams): Promise<void> {
    const { message } = data;
    // console.log('message:', message);
    if (!message || (!message.text && !message.caption)) {
      return;
    }

    const text = message.text || message.caption;

    if (ignoreTexts.includes(text)) {
      return;
    }

    let orderParser: IOrderParser;
    if (text.startsWith('$')) {
      orderParser = this.orderParserFactory.getParser(ParserType.BEYONDER_ADMIN);
    } else {
      orderParser = this.orderParserFactory.getParser(ParserType.BEYONDER_BOT);
    }

    const orderDetail = orderParser.execute(text);
    console.log('orderDetail:', orderDetail);

    try {
      const orderPlaced = await this.exchange.placeOrder(orderDetail);
      await this.reply(message, `🫡 Order placed with leverage: ${orderPlaced.leverage}`);
    } catch (err) {
      console.error('place order error:', err);
      await this.reply(message, err.message);
    }
  }

  private async reply(message: ITelegramMessage, content: string): Promise<void> {
    const params: any = {
      chat_id: message.chat.id,
      text: content,
    };

    await this.httpClient.get({
      path: `/bot${this.botKey}/sendMessage`,
      params
    });
  }
}
