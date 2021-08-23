import { range, setChatEnv } from '../src/usefulFunctions.js'
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



export const patchCommand =  Composer.command('patch', async (ctx) => {
    if (ctx.from.id != 615990377){
        ctx.reply("Vai se fuder sua puta :)")
        return
    } else{
        ctx.reply('Welcome')
    }
    

    let groupJSON
    let chatID = await ctx.chat.id;
    let group = await db.Weabot.findOrCreate({
        where: {groupID: chatID.toString()},
        defaults:{
            groupInfo: {
                "waifusCaptured": [],
                "waifusDead" : [],
                "waifusNotGenerated": range(1, 50000),
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
        if (groupJSON.hasOwnProperty("activeWaifus")){
            console.log("nice")
        }
        else{
            groupJSON.activeWaifus = []
        }

        // regenerate non-catched waifus
        let notGenerated = range(1, 50000)
        notGenerated = notGenerated.filter(element => {
            let result = []
            groupJSON.users.forEach(user => {
                let found = user.waifus.find(yes => yes.id == element)
                if (typeof found != "undefined"){
                    result.push(found.id)
                }
            })
            if (result.includes(element)){
                return false
            }
            return true
        })

        //patch users whose waifus doesnt jave series properties

        for (let user of groupJSON.users ){

            for ( let waifu of user.waifus ) {
                if (!waifu.hasOwnProperty('series')){
                    let waifuData = await getWaifuData(waifu.id);
                    
                    if (!waifuData && !waifuData.data.data.series){
                        waifu.series = "Extra"
                    } else {
                        waifu.series = waifuData.data.data.series.name
                    }
                    
                }
            }

            try {
                const result = await db.Weabot.update(
                    {groupInfo: JSON.stringify(groupJSON)},
                    {where: {groupID: chatID}}
                )
            } catch (err){
                console.log(err)
            }
            
        }
        
        // patch preferences

        for (let user of groupJSON.users ){

            if (!user.hasOwnProperty('preferences')){
                user.preferences = {}
            }   
        }

        // patch duplicate waifus

        for (let user of groupJSON.users ){
            user.waifus.filter((waifu, index, array) => array.findIndex(w => w.id == waifu.id) == index)
        }

        groupJSON.waifusNotGenerated = notGenerated
        groupJSON.transactions = []
        try {
            const result = await db.Weabot.update(
                {groupInfo: JSON.stringify(groupJSON)},
                {where: {groupID: chatID}}
            )
        } catch (err){
            console.log(err)
        }
        ctx.reply("Patch applied successfully")
    }
    
})