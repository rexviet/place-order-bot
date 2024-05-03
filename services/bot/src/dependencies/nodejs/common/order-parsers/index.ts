import { IOrderDetail } from '../orderDetail';

export interface IOrderParser {
    execute(text: string): IOrderDetail;
}

export * from './beyonder-parser';
export * from './parser-factory';
