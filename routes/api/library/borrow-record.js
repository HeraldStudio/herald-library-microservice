exports.route={
    async get({cardnum}){
        if(!cardnum){
            throw '空一卡通号'
        }

        let record =await this.db.execute(`
            SELECT COUNT(*) FROM XSC_LIBRARY_CHECKOUT WHERE DZTM = :cardnum`,{cardnum}
        ).then(records=>{
             return records.rows[0][0]
        }).catch(e=>{
            console.log(e)
            throw '数据库查询错误'
        })
        return record
    }
}