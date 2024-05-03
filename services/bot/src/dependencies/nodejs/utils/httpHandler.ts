import lambdaWarmer from 'lambda-warmer';

export const requestHandler = (handler: (request: any) => any) => {
  return async (event: any, context: any) => {
    context.callbackWaitsForEmptyEventLoop = false;
    if (await lambdaWarmer(event)) return 'warmed';
    return await handler(event);
  };
};
