const axios = require('axios')
const uuid = require('uuid/v4')
exports.route={
    async get({ticket}){
        let casWeInfo = await axios.get(`https://xgbxscwx.seu.edu.cn/cas-we-can/serviceValidate?ticket=${ticket}&service=${encodeURIComponent('https://xgbxscwx.seu.edu.cn/library-show/#/loading')}&json=1`)
        let cardnum 
        try {
            cardnum = casWeInfo.data.cas_info.cardnum
        } catch (e) {
            throw 401
        }
        let checkRecord = await this.db.execute(`SELECT COUNT(*) FROM XSC_LIBRARY_ENTRY_RECORD WHERE CARDNUM = :cardnum`, {cardnum})
        if(checkRecord.rows[0][0] === 0){
            throw '无数据'
        }
        let token = uuid()
        let ip = this.request.headers['x-real-ip'] ? this.request.headers['x-real-ip'] : '0.0.0.0'
        console.log({cardnum, token, ip})
        await this.db.execute(`INSERT INTO XSC_LIBRARY_SHOW_AUTH
        (CARDNUM, TOKEN, USER_IP) VALUES
        (:cardnum, :token, :ip)
        `,{cardnum, token, ip})
        return token
    }
}