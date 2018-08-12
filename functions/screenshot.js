/*
 * screenshot function
 *
 * Example invocation:
 *
 * screenshot({
 *  page: await browser.newPage(),
 *  context: {
 *    url: 'https://example.com',
 *    type: 'jpeg',
 *    quality: 50,
 *    fullPage: false,
 *    omitBackground: true,
 * },
 * });
 *
 * @param args - object - An object with a puppeteer page object, and context.
 * @param args.page - object - Puppeteer's page object (from await browser.newPage)
 * @param args.context - object - An object of parameters that the function is called with. See src/schemas.ts
 */
module.exports = async function screenshot ({ page, context }) {
  const {
    url = null,
    gotoOptions,
    html,
    options = {},
  } = context;

  if (url !== null) {
    await page.goto(url, gotoOptions);
  } else {
    // Whilst there is no way of waiting for all requests to finish with setContent,
    // you can simulate a webrequest this way
    // see issue for more details: https://github.com/GoogleChrome/puppeteer/issues/728

    await page.setRequestInterception(true);
    page.once('request', request => {
      request.respond({ body: html });
      page.on('request', request => request.continue());
    });

    page.goto('http://localhost');

    await Promise.race([
      page.waitForNavigation({waitUntil: 'load'}),
      page.waitForNavigation({waitUntil: 'networkidle0'})
    ]);
  }

  const data = await page.screenshot(options);
  console.log('hit');

  return {
    data,
    type: options.type ? options.type : 'png'
  };
};
