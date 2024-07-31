const { rejects } = require('assert');
const axios = require('axios');
const fs = require('fs');
const { resolve } = require('path');
class API {
    constructor({ appID, appSecret }) {
        this.appID = appID;
        this.appSecret = appSecret;
        this.prefix = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
        //保存access_token
        this.saveAccessToken = function (token) {
            return new Promise((resolve, reject) => {
                fs.writeFile('access_token.txt', JSON.stringify(token), err => {
                    if (err) {
                        return reject(err)
                    }
                    resolve('写入access_token成功')
                })
            })

        }
        this.getAccessToken = function () {
            return new Promise((resolve, reject) => {
                fs.readFile('access_token.txt', 'utf-8', (err, data) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve(JSON.parse(data))
                })
            })
        }
    }
    //发起请求，获取access_token
    async get_access_token() {
        let token = {}
        const res = await axios.get(`${this.prefix}${this.appID}&secret=${this.appSecret}`)
        // console.log(res.data)
        const expiresTime = Date.now() + (res.data.expires_in - 20) * 1000;
        token.accessToken = res.data.access_token;
        token.expiresTime = expiresTime;
        //存access_token到文件中
        let msg = await this.saveAccessToken(token);
        // console.log(msg)
        return token
    }
    //读取文件获取token,如果读取失败，重新请求接口  
    async ensureAccessToken() {
        let token = {}
        //获取文件中的数据
        try {
            token = await this.getAccessToken();
        } catch (error) {
            //读取文件失败  
            token = await this.get_access_token()
        }
        if (token && this.isValid(token)) {
            //没过期
            return token
        }
        return this.get_access_token();
    }
    //验证access_token是否过期
    isValid({ accessToken, expiresTime }) {
        return !!accessToken && Date.now < expiresTime;
    }

    //创建自定义菜单
    async createMenu(menu){
        //获取token
        const {accessToken} = await this.ensureAccessToken()
        const res = await axios.post(`https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${accessToken}`,menu)
        return res.data
    }
}
module.exports = API;