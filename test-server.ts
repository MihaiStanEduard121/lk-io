import { getExpressApp } from './src/server/expressApp.ts';

try {
  console.log('Testing Express App initialization...');
  const app = getExpressApp();
  console.log('Express App initialized successfully!');
  
  // Let's inspect routing
  console.log('Inspecting routes...');
  const routes: string[] = [];
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) { // routes registered directly on the app
      routes.push(middleware.route.path);
    } else if (middleware.name === 'router') { // router middleware
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          routes.push(handler.route.path);
        }
      });
    }
  });
  console.log('Registered Routes:', routes);
} catch (err: any) {
  console.error('Error during initialization:', err);
  process.exit(1);
}
