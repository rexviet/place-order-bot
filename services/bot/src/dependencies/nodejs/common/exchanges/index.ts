import { IOrderDetail } from '../orderDetail';

export interface IExchange {
    placeOrder(orderDetail: IOrderDetail): Promise<IOrderDetail>;
}

export * from './bitget.exchange';
