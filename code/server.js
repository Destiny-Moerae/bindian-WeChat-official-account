

const Koa = require('koa');
const wechat = require('co-wechat');
const config = require('./config');
const API = require('./wechat/access_token');
const processArticles = require('./wechat/handleArticles');
const { connectDB } = require('./wechat/db');

const app = new Koa();
const api = new API(config);

app.use(wechat(config).middleware(async (message, ctx) => {
    const response = await processArticles(api, message.Content);
    return response;
}));
connectDB().then(() => {
    console.log('数据库连接成功');
}).catch(err => {
    console.log('数据库连接失败：', err);
});

app.listen(443, () => {
    console.log('服务器启动在443端口上');
});