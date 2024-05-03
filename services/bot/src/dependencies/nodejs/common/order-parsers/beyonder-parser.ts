import { IOrderParser } from '.';
import { OrderDirection } from '../enum';
import { IOrderDetail, OrderDetail } from '../orderDetail';

export class BeyonderBotParser implements IOrderParser {
  public execute(text: string): IOrderDetail {
    const [symbolPart, entryPart, slPart, tpPart] = text.split('\n');
    const symbol = symbolPart.split(' ')[0];
    const direction = symbolPart.split(' ')[2] as OrderDirection;
    const entryPrice = entryPart.split(' ')[3];
    const slPrice = slPart.split(' ')[3];
    const tpPrice = tpPart.split(' ')[3];
    const riskPart = slPart.split(' ').pop();
    const risk = riskPart.substring(1, riskPart.length - 2);

    return new OrderDetail(
      symbol,
      direction,
      entryPrice,
      slPrice,
      tpPrice,
      risk,
    );
  }
}

export class BeyonderAdminParser implements IOrderParser {
  public execute(text: string): IOrderDetail {
    text.startsWith;
    const [symbolPart, entryPart, slPart, tpPart] = text.split('\n\n');
    const symbol = symbolPart.split(' ')[0].substring(1);
    const direction = ['BUY', 'LONG'].includes(
      symbolPart.split(' ')[1].toLocaleUpperCase(),
    )
      ? OrderDirection.BUY
      : OrderDirection.SELL;
    const entryPrice = entryPart.replace(/ /g, '').split(':')[1];

    const slAndRisk = slPart.replace(/ /g, '').split(':')[1];
    const [slPrice, riskPart] = slAndRisk.split('(');

    const tpPrice = tpPart.replace(/ /g, '').split('-')[1];
    const risk = riskPart.substring(0, riskPart.length - 2);

    return new OrderDetail(
      symbol,
      direction,
      entryPrice,
      slPrice,
      tpPrice,
      risk,
    );
  }
}
