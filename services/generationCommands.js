import {activeWaifu} from '../services/activeChar.js'
import {getWaifuData} from '../services/getChar.js'
import { range, setChatEnv } from '../src/usefulFunctions.js'
import db from '../models/index.js'
import {Composer} from "telegraf"

export const catchCommand = Composer.command('catch', async (ctx) => {
    let chatID = await ctx.chat.id;
    let groupJSON = await setChatEnv(ctx)
    const ids = groupJSON.users.map(a => a.id)

    if (ids.includes(ctx.from.id)){
        console.log(`${ctx.from.first_name} is trying to catch this character`)
    }else{
        ctx.reply(`${ctx.from.first_name} is trying to catch a character for the first time`)
        groupJSON.users.push({
            "id": ctx.from.id,
            "name": ctx.from.first_name,
            "waifus": [],
            "lastRwaifu": +new Date(),
            "preferences": {}
        })
        try {
            const result = await db.Weabot.update(
                {groupInfo: JSON.stringify(groupJSON)},
                {where: {groupID: chatID}}
            )
        } catch (err){
            console.log(err)
        }
        
    }

    const waifuName = ctx.update.message.text.split(" ")[1]
    const waifu = ctx.message.reply_to_message;
    if (typeof waifu === 'undefined'){
        ctx.reply("Remember to pass a name and reply the correct character photo")
    }else{
        const waifuActive = groupJSON.activeWaifus.find(element => element.photoId == waifu.photo[0].file_unique_id)

        if (typeof waifuActive === 'undefined' || typeof waifuName === 'undefined'){
            ctx.reply("This character isnt currently active or is not a char at all. Or... you should at least pass a name")
        } else{
            if (waifuActive.waifuName.toLowerCase().split(" ").includes(waifuName.toLowerCase()) || waifuActive.waifuName.toLowerCase() == waifuName.toLowerCase()){
                ctx.reply(`You got this char, very nice ${ctx.message.from.first_name}-chan`)
                groupJSON.activeWaifus = groupJSON.activeWaifus.filter(waifu => {
                    return (waifu.waifuName != waifuActive.waifuName)
                })
                groupJSON.waifusCaptured.push(waifuActive.waifuName)
                groupJSON.users.forEach( (element) => {
                    if (element.id === ctx.from.id){
                        element.waifus.push({
                            "name":  waifuActive.waifuName,
                            "id":    waifuActive.waifuId,
                            "image": waifuActive.photoUrl,
                            "series": waifuActive.series
                        })
                    }
                })
                try {
                    const result = await db.Weabot.update(
                        {groupInfo: JSON.stringify(groupJSON)},
                        {where: {groupID: chatID}}
                    )
                } catch (err){
                    console.log(err)
                }

            }else{
                ctx.reply(`Baka ${ctx.message.from.first_name}, the name is wrong ::))`)
            }
        }
    }
    
})

export const rcharCommand = Composer.command('rchar', async (ctx) => {
    let chatID = await ctx.chat.id;
    let groupJSON = await setChatEnv(ctx)
    const ids = groupJSON.users.map(a => a.id)

    if (ids.includes(ctx.from.id)){
        let user = groupJSON.users.find(element => element.id == ctx.from.id)
        if (Math.floor(Math.abs(+new Date() - user.lastRwaifu))/1000 < 60*60){
            ctx.reply(`${ctx.from.first_name} Already used their rchar, ${Math.ceil((60*60 - Math.floor(Math.abs(+new Date() - user.lastRwaifu))/1000)/60)} minutes left.`)
            return
        } else{
            ctx.reply(`${ctx.from.first_name} Generated some chars`)
            user.lastRwaifu = +new Date()
        }
        
    }else{
        ctx.reply(`${ctx.from.first_name} Generated 10 chars for the first time`)
        groupJSON.users.push({
            "id": ctx.from.id,
            "name": ctx.from.first_name,
            "waifus": [],
            "lastRwaifu": (+new Date()) -3600*1000,
            "preferences": {}
        })
        try {
            const result = await db.Weabot.update(
                {groupInfo: JSON.stringify(groupJSON)},
                {where: {groupID: chatID}}
            )
        } catch (err){
            console.log(err)
        }
        
    }

    groupJSON.activeWaifus = groupJSON.activeWaifus.filter(element => {
        if (Math.floor(Math.abs(element.createdAt - +new Date())/1000) > 60*60*12){
            groupJSON.waifusDead.push(element.waifuId)
            return false
        }
        return true
    })

    if (groupJSON.waifusNotGenerated.length % 3000 == 0){
        let waifuReturn = groupJSON.waifusDead.splice(0, 1000)
        groupJSON.waifusNotGenerated.push(...waifuReturn)
    }

/*     if (groupJSON.waifusNotGenerated.length < 3000){
        let waifuReturn = groupJSON.waifusDead.splice(0, 15000)
        groupJSON.waifusNotGenerated.push(...waifuReturn)
    } */

    for (let j = 0; j < 10; j++) {
        let random = Math.floor(Math.random() * groupJSON.waifusNotGenerated.length);
        let newWaifu = groupJSON.waifusNotGenerated.splice(random, 1)
        let photoFileInfo

        let waifuData = await getWaifuData(newWaifu);
        if (typeof waifuData !== 'undefined' && !groupJSON.waifusCaptured.includes(waifuData.name)){
            try {
                photoFileInfo = await ctx.replyWithPhoto(waifuData.data.data.display_picture.replace("_thumb", ""))
                console.log(waifuData.data.data.name)
                
                let re = /["(),]/gi
                let correctWaifuName = waifuData.data.data.name.replace(re, "")
                let charSeries = waifuData.data.data.series.name
                if (typeof charSeries == 'undefined'){
                    charSeries = "Extra"
                }
                groupJSON.activeWaifus.push(activeWaifu(newWaifu, correctWaifuName, ctx.chatMember, ctx.chat.id, photoFileInfo.photo[0].file_unique_id, waifuData.data.data.display_picture.replace("_thumb", ""), charSeries))
                try {
                    const result = await db.Weabot.update(
                        {groupInfo: JSON.stringify(groupJSON)},
                        {where: {groupID: chatID}}
                    )
                    groupJSON = await setChatEnv(ctx)
                } catch (err){
                    console.log(err)
                }
            } catch (error) {
                console.log(error)
            }
        } else{
            try {
                const result = await db.Weabot.update(
                    {groupInfo: JSON.stringify(groupJSON)},
                    {where: {groupID: chatID}}
                )
                groupJSON = await setChatEnv(ctx)
            } catch (err){
                console.log(err)
            }
            j -= 1
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

    
})