import { range, setChatEnv, sleep } from '../src/usefulFunctions.js'
import db from '../models/index.js'
import {Composer} from "telegraf"
import {getWaifuData} from '../services/getChar.js'

/* export const minipatchCommand = Composer.command('minipatch', async (ctx) => {
    if (ctx.from.id != 615990377){
        ctx.reply("Vai se fuder sua puta :)")
        return
    } else{
        ctx.reply("Mini patch applied successfully")
    }
    ctx.reply('Welcome')

    let groupJSON
    let chatID = await ctx.chat.id;
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
        groupJSON = JSON.parse(group[0].groupInfo)
        
        
        let more = range(36200, 37200)

        groupJSON.waifusNotGenerated = groupJSON.waifusNotGenerated.concat(more)
        groupJSON.transactions = []
        try {
            const result = await db.Weabot.update(
                {groupInfo: JSON.stringify(groupJSON)},
                {where: {groupID: chatID}}
            )
        } catch (err){
            console.log(err)
        }
    }
    
}) */


export const minipatchCommand = Composer.command('minipatch', async (ctx) => {
    if (ctx.from.id != 615990377){
        ctx.reply("Vai se fuder sua puta :)")
        return
    } else{
        ctx.reply("Mini patch applied successfully")
    }
    ctx.reply('Welcome')

    let groupJSON
    let chatID = await ctx.chat.id;
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
        groupJSON = JSON.parse(group[0].groupInfo)
        
        //groupJSON.users[0].waifus = []
        let waifuData = await getWaifuData(36463);
        groupJSON.transactions = []
        try {
            const result = await db.Weabot.update(
                {groupInfo: JSON.stringify(groupJSON)},
                {where: {groupID: chatID}}
            )
        } catch (err){
            console.log(err)
        }
    }
    
})

