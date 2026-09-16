import { BrowserContext, Route } from '@playwright/test';

export const offlineMobileUrl = 'https://example.com/offline-mobile-fixture';

export async function installOfflineMobileMocks(context: BrowserContext): Promise<void> {
  await context.route('**/*', async (route: Route) => {
    const url = route.request().url();

    if (url === offlineMobileUrl || url.includes('offline-mobile-fixture')) {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: `
          <!doctype html>
          <html>
            <head>
              <title>ParaBank | Offline Mobile</title>
            </head>
            <body>
              <div id="mobile-offline-fixture">Offline mobile fixture</div>
              <div data-testid="offline-status">Offline mobile fixture</div>
            </body>
          </html>
        `,
      });
      return;
    }

    await route.continue();
  });
}
