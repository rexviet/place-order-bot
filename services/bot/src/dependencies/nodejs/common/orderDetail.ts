import { OrderDirection } from './enum';

export interface IOrderDetail {
  readonly symbol: string;
  readonly direction: OrderDirection;
  readonly entryPrice: string;
  readonly slPrice: string;
  readonly tpPrice: string;
  readonly risk: string;
  readonly leverage?: string;
}

export class OrderDetail implements IOrderDetail {
  constructor(
    readonly symbol: string,
    readonly direction: OrderDirection,
    readonly entryPrice: string,
    readonly slPrice: string,
    readonly tpPrice: string,
    readonly risk: string,
  ) {}
}
