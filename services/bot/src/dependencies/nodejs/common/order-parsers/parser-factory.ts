import { BeyonderAdminParser, BeyonderBotParser, IOrderParser } from '.';
import { ParserType } from '../enum';

export class ParserFactory {
    private beyonderBotParser: IOrderParser;
    private beyonderAdminParser: IOrderParser;

    public getParser(type: ParserType): IOrderParser {
        switch (type) {
            case ParserType.BEYONDER_ADMIN:
                if (!this.beyonderAdminParser) {
                    this.beyonderAdminParser = new BeyonderAdminParser();
                }
                return this.beyonderAdminParser;
            default:
                if (!this.beyonderBotParser) {
                    this.beyonderBotParser = new BeyonderBotParser();
                }
                return this.beyonderBotParser;
        }
    }
}