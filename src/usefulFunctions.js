
const path_db = process.cwd() + '/models/index.js'
//const {db} = require(path_db)
import db from '../models/index.js'
function range(start, end) {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start)
}

const setChatEnv = async (ctx) => {
    let groupJSON
    let chatID = await ctx.chat.id
    let group = await db.Weabot.findOrCreate({
        where: {groupID: chatID.toString()},
        defaults:{
            groupInfo: {
                "waifusCaptured": [],
                "waifusDead" : [],
                "waifusNotGenerated": range(1, 36000),
                "users": [],
                "transactions": [],
                "activeWaifus": []
            }
        }
    })
    if (group[1] === true){
        groupJSON = group[0].groupInfo
    }else{
        if (typeof group[0].groupInfo == "object"){
            groupJSON = group[0].groupInfo
        } else{
            groupJSON = JSON.parse(group[0].groupInfo)
        }
        
        //groupJSON.transactions = []
    }

    return groupJSON
}

export {range, setChatEnv}