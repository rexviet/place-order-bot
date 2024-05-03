import { APIGatewayProxyEvent } from 'aws-lambda';
import HttpStatusCode from '/opt/nodejs/common/httpStatusCode';
import {
  BotReceiveMessageUSImpl,
  IBotReceiveMessageUS,
} from './use-cases/botReceiveMessageUS';
import { IMessageParams } from './params';
import { ParserFactory } from '/opt/nodejs/common/order-parsers';
import { BitGetExchange } from '/opt/nodejs/common/exchanges';
import { PhinHttpClient } from '/opt/nodejs/utils/httpClient';

let botReceiveMessageUS: IBotReceiveMessageUS;

const func = async (event: APIGatewayProxyEvent) => {
  if (!botReceiveMessageUS) {
    botReceiveMessageUS = initBotReceiveMessageUS();
  }

  const body = event.body;

  if (!body) {
    return {
      statusCode: HttpStatusCode.OK,
    };
  }

  const messageParams = JSON.parse(body) as IMessageParams;

  await botReceiveMessageUS.execute(messageParams);

  return {
    statusCode: HttpStatusCode.OK,
  };
};

const initBotReceiveMessageUS = () => {
  const orderParserFactory = new ParserFactory();
  const httpClient = new PhinHttpClient('https://api.bitget.com');
  const exchange = new BitGetExchange(
    httpClient,
    process.env.API_KEY,
    process.env.SECRET_KEY,
    process.env.PASSPHRASE,
    'USDT',
    'USDT-FUTURES',
    30,
    10,
  );
  const botClinet = new PhinHttpClient('https://api.telegram.org');
  return new BotReceiveMessageUSImpl(orderParserFactory, exchange, botClinet, process.env.BOT_KEY);
};

exports.handler = func;
