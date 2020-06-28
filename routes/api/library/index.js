const { promises } = require("fs")

let total_sch = 0
let total_col = {}

exports.route={
    /**
     * 
     * @param   {String}    cardnum             一卡通号 
     * 
     * @returns {String}    firstEntryTime      第一次入馆
     * @returns {Number}    entryCount          入馆次数
     * @returns {Number}    entryCollegeRank    入馆次数学院排名
     * @returns {Number}    entrySchoolRank     入馆次数学校排名
     * 
     * @returns {String}    firstBook    第一本书
     * @returns {Number}    checkoutCount        借书数量
     * @returns {Number}    borrow-rank-dept    结束数量学院排名
     * @returns {Number}    checkoutSchoolRank     借书数量学校排名
     * 
     * @returns {Array<String>} recommendList       推荐书籍
     */
    async get({cardnum}){
        let ret = {
            'name':'',
            'firstEntryTime':'',
            'entryCount':0,
            'entryCollegeRank':'',
            'entrySchoolRank':'',
            'firstBook':'',
            'checkoutCount':0,
            'checkoutCollegeRank':'',
            'checkoutSchoolRank':'',
            'recommendList':[],
        }

        if(!cardnum)
            throw '一卡通为空'

        
        if(total_sch === 0){
            await this.db.execute(`
                SELECT COLLEGE,COUNT(DISTINCT(CARDNUM)) FROM XSC_LIBRARY_ENTRY_RECORD GROUP BY COLLEGE
            `).then(records=>{
                records.rows.forEach((record) => {
                    total_sch +=record[1]
                    total_col[record[0]] = record[1]
                });
            })
        }

        let entry_record = await this.db.execute(`
            SELECT * FROM XSC_LIBRARY_ENTRY_RECORD WHERE CARDNUM = :cardnum`,{cardnum}
        ).then(records=>{
            if(records.rows.length>0){
                ret['name'] = records.rows[0][1]
                ret['firstEntryTime'] = records.rows[0][3]
                ret['entryCount'] = records.rows[0][4]
                return records.rows[0]
            }else
                return null
        }).catch(e=>{
            console.log(e)
            throw '数据库查询错误'
        })

        if(entry_record){
            await this.db.execute(`
                SELECT a.ROWNO,b.ROWNO FROM
                    (SELECT rank()  over (ORDER BY COUNT asc ) ROWNO,R.CARDNUM FROM XSC_LIBRARY_ENTRY_RECORD R ) a,
                    (SELECT rank() over (ORDER BY COUNT asc ) ROWNO,R.CARDNUM FROM XSC_LIBRARY_ENTRY_RECORD R WHERE COLLEGE=:college ) b
                WHERE a.CARDNUM=b.CARDNUM AND a.CARDNUM=:cardnum
            `,{cardnum,college:entry_record[2]}).then(records=>{
                ret['entrySchoolRank'] = (records.rows[0][0]/total_sch*100).toFixed(1)
                ret['entryCollegeRank'] = records.rows[0][1]
            }).catch(e=>{
                console.log(e)
                throw '数据库查询错误'
            })
        }


        let borrow_record = await this.db.execute(
           `SELECT * FROM XSC_LIBRARY_CHECKOUT WHERE DZTM = :cardnum ORDER BY JYSJ ASC`,{cardnum}
        ).then(records=>{
            if(records.rows.length>0){
                ret['firstBook'] = records.rows[0][5]
                ret['checkoutCount'] = records.rows.length
                return records.rows[0]
            }
        }).catch(e=>{
            console.log(e)
            throw '数据库查询错误'
        })

        if(entry_record){
            await this.db.execute(`
            SELECT a.ROWNO,b.ROWNO FROM
                (SELECT rank()  over (ORDER BY BCOUNT asc ) ROWNO,R.CARDNUM FROM XSC_LIBRARY_ENTRY_RECORD R ) a,
                (SELECT rank() over (ORDER BY BCOUNT asc ) ROWNO,R.CARDNUM FROM XSC_LIBRARY_ENTRY_RECORD R WHERE COLLEGE=:college ) b
            WHERE a.CARDNUM=b.CARDNUM AND a.CARDNUM=:cardnum
            `,{cardnum,college:entry_record[2]}).then(records=>{
                ret['checkoutSchoolRank'] = (records.rows[0][0] / total_sch * 100).toFixed(1)
                ret['checkoutCollegeRank'] = records.rows[0][1]
            }).catch(e=>{
                console.log(e)
                throw '数据库查询错误'
            })
        }

        let promises=[]
        await this.db.execute(`
        SELECT * FROM (
            SELECT * FROM XSC_LIBRARY_RELATION WHERE CARDNUM1=:cardnum OR CARDNUM2=:cardnum 
        )WHERE ROWNUM<=3
        `,{cardnum}).then(records=>{
            for(let row of records.rows){
                let others = row[0]
                if(others === cardnum)
                    others = row[1]
                promises.push(this.db.execute(`
                    SELECT BOOK_NAME FROM XSC_LIBRARY_CHECKOUT_BRIEF WHERE CARDNUM=:cardnum
                `,{cardnum:others}))
            }
            //相似度大于0的不足三个时
            while(promises.length<3){
                promises.push(this.db.execute(`
                SELECT TM FROM (
                    SELECT * FROM XSC_LIBRARY_CHECKOUT
                    WHERE YXMC = ( SELECT YXDM FROM T_BZKS_TMP WHERE XH = :cardnum  )
                    AND DZTM != :cardnum ORDER BY DBMS_RANDOM.VALUE()
                )WHERE ROWNUM=1
                `,{cardnum}))
            }
        }).catch(e=>{
            console.log(e)
            throw '数据库查询错误'
        })

        await Promise.all(promises).then(records=>{
            for(let record of records){
                if(record.rows.length>0){
                    ret.recommendList.push(record.rows[0][0])
                }
            }
        }).catch(e=>{
            console.log(e)
            throw '数据库查询错误'
        })

        return ret
    }
}