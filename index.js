import LBCParser from './LBCParser.js';
import fs from 'fs';
import nodemailer from "nodemailer";

let lbcUrl = 'https://www.leboncoin.fr/recherche/?category=9&locations=Nantes&real_estate_type=1&price=min-325000&rooms=3-max&square=70-max';
let fileName = '/Users/florian/www/ImmoSelf/ad.json';

(async () => {
    let newLinks = [];
    let lbc = new LBCParser(lbcUrl);
    newLinks = newLinks.concat(await lbc.getAdverts());

    let oldLinks = [];
    if (fs.existsSync(fileName)) {
        try {
            oldLinks = JSON.parse(fs.readFileSync(fileName));
        } catch (e) {}

        let newAds = [];
        newLinks.forEach(link => {
            if (-1 === oldLinks.indexOf(link)) {
                newAds.push(link);
            }
        });

        if (oldLinks.length > 0 && newAds.length > 0) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'florian.roy@display-interactive.com',
                    pass: 'Fr0yD1spl4y'
                }
            });

            const mailOptions = {
                from: 'florian.roy@display-interactive.com', // sender address
                to: 'florian.roy@gmail.com', // list of receivers
                subject: 'Nouvelles annonces immobilières pour nous', // Subject line
                html: newAds.join("<br/>\n")
            };
            transporter.sendMail(mailOptions);
        }
    }

    fs.writeFileSync(fileName, JSON.stringify(newLinks.concat(oldLinks)));
})();