import cron from 'node-cron';
import { runArticleScraper } from './scraperService.js';
import { epgService } from './epgService.js';
import axios from 'axios';

let cronTask: any = null;
let scrapingInterval = '*/5 * * * *'; // default 5 minutes
let isEnabled = false; // Need to load from DB

export function startCronJobs() {
  console.log('Cron jobs service started. Waiting for config...');
  
  cronTask = cron.schedule(scrapingInterval, async () => {
    if (isEnabled) {
      console.log('Running scheduled scraper...');
      await runArticleScraper();
    }
  });

  // Automatically check live scores every 2 minutes mapped to ESPN API
  cron.schedule('*/2 * * * *', async () => {
    try {
      console.log('Running automatic World Cup live scores sync from ESPN...');
      await fetch(`http://localhost:3000/api/live-scores/sync`);
    } catch (e) {
      console.error('Error triggering live scores sync via cron', e);
    }
  });

  // Automatically refresh EPG data every 4 hours
  cron.schedule('0 */4 * * *', async () => {
    try {
      console.log('[Cron] Running scheduled EPG feed refresh...');
      await epgService.syncEPG(false);
    } catch (e) {
      console.error('[Cron] Error refreshing EPG via cron', e);
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
