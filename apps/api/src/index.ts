import { loadApiConfig } from './config/env.js';
import { buildApp } from './app.js';

export async function main() {
  let config;
  try {
    config = loadApiConfig();
  } catch (err) {
    // Write failure to stderr directly so it's impossible to miss
    console.error('Fatal API configuration error during bootstrap:');
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const app = buildApp({ config });

  // Graceful shutdown handling
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info({ signal }, 'Received termination signal, shutting down gracefully...');
      try {
        await app.close();
        app.log.info('API server closed successfully.');
        process.exit(0);
      } catch (closeErr) {
        app.log.error({ err: closeErr }, 'Error during graceful shutdown');
        process.exit(1);
      }
    });
  }

  try {
    await app.listen({
      port: config.PORT,
      host: config.HOST,
    });
    app.log.info(
      {
        host: config.HOST,
        port: config.PORT,
        nodeEnv: config.NODE_ENV,
      },
      'Dadliesttjokes Content Factory API started successfully',
    );
  } catch (err) {
    app.log.error({ err }, 'Failed to start API server');
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  main();
}
