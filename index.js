const { Client } = require('discord.js')
const schedule = require('node-schedule');
const express = require('express');
require('heroku-self-ping').default(`https://fierce-bayou-48691.herokuapp.com/`, {interval: 1000 * 60 * 5});

const path = require('path')
const PORT = process.env.PORT || 5000

express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))

const client = new Client();

client.login(process.env.token);

const CRON_EVERYDAY_AT_10 = '0 7 * * *'
const DEFAULT_CHANNEL_NAME = '8ra2at'

let job;
let activePage = 176;

client.once('ready', async () => {
    const defaultChannel = client.channels.cache.find(channel => channel.name === DEFAULT_CHANNEL_NAME);
    setup(defaultChannel, CRON_EVERYDAY_AT_10)
});

client.on('message', (message) => {
    if (message.author.bot) {
        return;
    }
    if (message.content.indexOf('qurran-configure-page') !== -1) {
        const msg = message.content.replace('qurran-configure-page', '');
        try {
            const newActivePage = Number.parseInt(msg);
            if (!(newActivePage < 604 && newActivePage > 0)) {
                message.channel.send("The new page count should be within [604, 0]")
                console.error("ERROR invalid range")
            } else {
                activePage = newActivePage;
                console.log("SUCCESS")
                message.channel.send("Now the active page is " + activePage)
            }
        } catch (e) {
            console.error("ERROR")
            message.channel.send("The Page # is invalid")
        }
    } else if (message.content.indexOf('send qurran') !== -1) {
        message.channel.send({
            files: [{
                attachment: `https://www.daily-quran.com/static/pages/page-${activePage}.jpg`,
                name: `qurran-${activePage}.jpg`
            }]
        });
        message.channel.send({
            files: [{
                attachment: `https://www.daily-quran.com/static/pages/page-${activePage+1}.jpg`,
                name: `qurran-${activePage+1}.jpg`
            }]
        });
        activePage = activePage + 2;
    }
});

const setup = (channel, cronExp) => {
    job = schedule.scheduleJob(cronExp, function () {
        const today = new Date().getDate();
        const base = 171;
        const activePage = base + today;
        channel.send({
            files: [{
                attachment: `https://www.daily-quran.com/static/pages/page-${activePage}.jpg`,
                name: `qurran-${activePage}.jpg`
            }]
        });
        channel.send({
            files: [{
                attachment: `https://www.daily-quran.com/static/pages/page-${activePage+1}.jpg`,
                name: `qurran-${activePage+1}.jpg`
            }]
        });
    });
};