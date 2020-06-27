
let entry_total_sch = 0
let entry_total_col = {}
let borrow_total_sch = 0
let borrow_total_col = {}

exports.route={
    /**
     * 
     * @param   {String}    cardnum             一卡通号 
     * 
     * @returns {String}    entry-first         第一次入馆
     * @returns {Number}    entry-count         入馆次数
     * @returns {Number}    entry-rank-dept     入馆次数学院排名
     * @returns {Number}    entry-rank-sch      入馆次数学校排名
     * 
     * @returns {String}    borrow-firstbook    第一本书
     * @returns {Number}    borrow-count        借书数量
     * @returns {Number}    borrow-rank-dept    结束数量学院排名
     * @returns {Number}    borrow-rank-sch     借书数量学校排名
     * 
     * @returns {Array<String>} recommend       推荐书籍
     */
    async get({cardnum}){
        let ret = {
            'entry-first':'',
            'entry-count':'',
            'entry-rank-col':'',
            'entry-rank-sch':'',
            'borrow-firstbook':'',
            'borrow-count':'',
            'borrow-rank-col':'',
            'borrow-rank-sch':'',
            'recommend':'',
        }

        if(!cardnum)
            throw '一卡通为空'

        
        if(entry_total_sch === 0){
            await this.db.execute(`
                SELECT COLLEGE,COUNT(DISTINCT(CARDNUM)) FROM XSC_LIBRARY_ENTRY_RECORD GROUP BY COLLEGE
            `).then(records=>{
                records.rows.forEach((record) => {
                    entry_total_sch +=record[1]
                    entry_total_col[record[0]] = record[1]
                });
            })

            await this.db.execute(`
                SELECT YXMC,COUNT(DISTINCT(DZTM)) FROM XSC_LIBRARY_CHECKOUT GROUP BY YXMC
            `).then(records=>{
                records.rows.forEach((record) => {
                    borrow_total_sch +=record[1]
                    borrow_total_col[record[0]] = record[1]
                });
            })
        }

        let entry_record = await this.db.execute(`
            SELECT * FROM XSC_LIBRARY_ENTRY_RECORD WHERE CARDNUM = :cardnum`,{cardnum}
        ).then(records=>{
            if(records.rows.length>0){
                ret['entry-first'] = records.rows[0][3]
                ret['entry-count'] = records.rows[0][4]
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
                    (SELECT rank()  over (ORDER BY COUNT desc ) ROWNO,R.CARDNUM FROM XSC_LIBRARY_ENTRY_RECORD R ) a,
                    (SELECT rank() over (ORDER BY COUNT desc ) ROWNO,R.CARDNUM FROM XSC_LIBRARY_ENTRY_RECORD R WHERE COLLEGE=:college ) b
                WHERE a.CARDNUM=b.CARDNUM AND a.CARDNUM=:cardnum
            `,{cardnum,college:entry_record[2]}).then(records=>{
                ret['entry-rank-sch'] = records.rows[0][0]
                ret['entry-rank-col'] = records.rows[0][1]
            }).catch(e=>{
                console.log(e)
                throw '数据库查询错误'
            })
        }


        let borrow_record = await this.db.execute(
           `SELECT * FROM XSC_LIBRARY_CHECKOUT WHERE DZTM = :cardnum ORDER BY JYSJ ASC`,{cardnum}
        ).then(records=>{
            if(records.rows.length>0){
                ret['borrow-firstbook'] = records.rows[0][5]
                ret['borrow-count'] = records.rows.length
                return records.rows[0]
            }
        }).catch(e=>{
            console.log(e)
            throw '数据库查询错误'
        })

        if(borrow_record){
            await this.db.execute(`
            WITH borrow_count AS
                (SELECT DZTM,YXMC,count(*) COUNT FROM XSC_LIBRARY_CHECKOUT GROUP BY DZTM,YXMC)
            SELECT a.ROWNO,b.ROWNO FROM
                (SELECT rank()  over (ORDER BY COUNT desc ) ROWNO,R.DZTM FROM borrow_count R ) a,
                (SELECT rank() over (ORDER BY COUNT desc ) ROWNO,R.DZTM FROM borrow_count R WHERE R.YXMC= :college) b
            WHERE a.DZTM=b.DZTM AND a.DZTM= :cardnum
            `,{cardnum,college:entry_record[2]}).then(records=>{
                ret['borrow-rank-sch'] = records.rows[0][0]
                ret['borrow-rank-col'] = records.rows[0][1]
            }).catch(e=>{
                console.log(e)
                throw '数据库查询错误'
            })
        }

        return {
            ret,
            entry_total_sch ,
            entry_total_col ,
            borrow_total_sch,
            borrow_total_col,
        };
    }
}