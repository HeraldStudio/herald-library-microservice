exports.route={
    async get({cardnum}){
        if(!cardnum){
            throw '空一卡通号'
        }

        let record =await this.db.execute(`
            SELECT * FROM XSC_LIBRARY_ENTRY_RECORD WHERE CARDNUM = :cardnum`,{cardnum}
        ).then(records=>{
            if(records.rows.length>0){
                return records.rows[0]
            }else{
                return []
            }
        }).catch(e=>{
            console.log(e)
            throw '数据库查询错误'
        })
        return record
    }
}