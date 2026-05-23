import cron from 'node-cron';
import { runArticleScraper } from './scraperService.js';

let cronTask: cron.ScheduledTask | null = null;
let scrapingInterval = '*/5 * * * *'; // default 5 minutes
let isEnabled = false; // Need to load from DB

export function startCronJobs() {
  console.log('Cron jobs service started. Waiting for config...');
  // We can fetch config periodically or on demand.
  // We'll just define the job here.
  cronTask = cron.schedule(scrapingInterval, async () => {
    if (isEnabled) {
      console.log('Running scheduled scraper...');
      await runArticleScraper();
    }
  });
}

export function updateCronConfig(enabled: boolean, intervalStr: string) {
  isEnabled = enabled;
  if (intervalStr && intervalStr !== scrapingInterval) {
    scrapingInterval = intervalStr;
    if (cronTask) {
      cronTask.stop();
    }
    cronTask = cron.schedule(scrapingInterval, async () => {
      if (isEnabled) {
        console.log('Running scheduled scraper...');
        await runArticleScraper();
      }
    });
  }
}
