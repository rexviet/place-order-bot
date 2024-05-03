export interface IMessageParams {
  readonly message: ITelegramMessage;
}

export interface ITelegramMessage {
  readonly message_id: number,
  readonly chat: {
    readonly id: number;
  };
  readonly text?: string;
  readonly caption?: string;
}
