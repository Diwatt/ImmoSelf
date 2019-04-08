import puppeteer from 'puppeteer';

export default class LBCParser {
    constructor(url) {
        this.url = url;
        this.succeed = false;
        //<a title="Maison 3 pièces 71 m²" class="clearfix trackable" rel="nofollow" href="/ventes_immobilieres/1422744026.htm/" data-reactid="544">
    }

    async getAdverts() {
        let browser = null,
            page = null;
        try {
            browser = await this.openBrowser();
            page = await browser.newPage();
            await page.setRequestInterception(true);

            page.on('request', (request) => {
                const headers = request.headers();
                headers['Accept'] = 'text/html';
                headers['Accept-Language'] = 'fr,en';
                headers['Accept-Encoding'] = 'identity';
                request.continue({headers});
            });



            await page.goto(this.url, {waitUntil: 'domcontentloaded'});
            const hrefs = await page.evaluate(() => {
                const anchors = document.querySelectorAll('a');
                return [].map.call(anchors, a => a.href);
            });

            this.succeed = true;
            await page.close();
            await browser.close();

            let regex = new RegExp('https:\/\/www\.leboncoin\.fr\/ventes_immobilieres\/[0-9]+\.htm\/', 'g');

            return hrefs.filter(link => {
                return regex.test(link);
            });


        } catch (e) {
            console.log('retry', e);
            if (null !== page) {
                await page.close();
            }
            if (null !== browser) {
                await browser.close();
            }
            if (false === this.succeed) {
                await this.getAdverts();
            }

        }
    }

    async openBrowser() {
        return await puppeteer.launch({
            headless: false,
            ignoreHTTPSErrors: true,
            args:[
                '--window-position=0,0',
                '--window-size=50,50',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--enable-features=NetworkService',
                '--ignore-certificate-errors'
            ]
        });
    }
}