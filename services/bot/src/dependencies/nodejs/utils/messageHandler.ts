import lambdaWarmer from 'lambda-warmer';
// import * as cjson from 'compressed-json';

export const messageHandler = (handler: (request: any) => any) => {
  return async (event: any) => {
    try {
      if (await lambdaWarmer(event)) return 'warmed';
      return await handler(event);
    } catch (error) {
      console.error('error:', error);
      throw error;
    }
  };
};
