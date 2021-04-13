import { Context, Telegraf} from 'telegraf'
import dotenv from "dotenv";
dotenv.config({path: './.env'})
import {getWaifuData} from './services/getWaifu.js'

import db from './models/index.js';


import {activeWaifu} from './services/activeWaifu.js'

function range(start, end) {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start)
}

const bot = new Telegraf (process.env.WAIFU)

let chatID
let group
let groupJSON

bot.start( async (ctx) => {
    db.Weabot.destroy({ truncate : true})
    ctx.reply('Welcome')
    chatID = await ctx.chat.id;
    group = await db.Weabot.findOrCreate({
        where: {groupID: chatID.toString()},
        defaults:{
            groupInfo: {
                "waifusCaptured": [],
                "waifusGenerated" : [],
                "waifusNotGenerated": range(1, 36000),
                "users": []
            }
        }
    })
    if (group[1] === true){
        groupJSON = group[0].groupInfo
    }else{
        groupJSON = JSON.parse(group[0].groupInfo)
    }
    
})




// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


let listWaifus = []

bot.launch()


bot.hears('hi', (ctx) => ctx.reply('Hey there'))


bot.command('show', async (ctx) => {
    ctx.reply("You have the following waifus: ")
    
    groupJSON.users.forEach( (element) => {
        if (element.username == ctx.from.username){
            element.waifus.forEach( async (waifu) => {
                try {
                    await ctx.replyWithPhoto({url: waifu.image}, {caption: waifu.name})    
                } catch (error) {
                    console.error(error)
                }
                
            })
        }
    })

})


bot.command('catch', async (ctx) => {


    const usernames = groupJSON.users.map(a => a.username)

    if (usernames.includes(ctx.from.username)){
        ctx.reply(`${ctx.from.first_name} is trying to catch this waifu`)
    }else{
        ctx.reply(`${ctx.from.first_name} is trying to catch a waifu for the first time`)
        groupJSON.users.push({
            "username": ctx.from.username,
            "waifus": [],
            "lastRwaifu": +new Date()
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
        ctx.reply("Remember to pass a name and reply the correct waifu photo")
    }else{
        const waifuActive = listWaifus.find(element => element.photoId == waifu.photo[0].file_unique_id)

        if (typeof waifuActive === 'undefined'){
            ctx.reply("This waifu isnt currently active or is not a waifu at all.")
        } else{
            if (waifuActive.waifuName.toLowerCase().split(" ").includes(waifuName.toLowerCase())){
                ctx.reply("You got the waifu, nice")
                listWaifus = listWaifus.filter(element => {
                    return (element.waifuName != waifuActive.waifuName)
                })
                groupJSON.waifusCaptured.push(waifuActive.waifuName)
                groupJSON.users.forEach( (element) => {
                    if (element.username === ctx.from.username){
                        element.waifus.push({
                            "name":  waifuActive.waifuName,
                            "image": waifuActive.photoUrl
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
                ctx.reply("Sorry, wrong waifu name.")
            }
        }
    }
    
})

bot.command('rwaifu', async (ctx) => {

    const usernames = groupJSON.users.map(a => a.username)

    if (usernames.includes(ctx.from.username)){
        let user = groupJSON.users.find(element => element.username == ctx.from.username)
        if (Math.floor(Math.abs(+new Date() - user.lastRwaifu))/1000 < 60*60){
            ctx.reply(`${ctx.from.first_name} Already used their rwaifu`)
            return
        } else{
            ctx.reply(`${ctx.from.first_name} Generated 10 waifus`)
        }
        
    }else{
        ctx.reply(`${ctx.from.first_name} Generated 10 waifus for the first time`)
        groupJSON.users.push({
            "username": ctx.from.username,
            "waifus": [],
            "lastRwaifu": +new Date()
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

    listWaifus = listWaifus.filter(element => {
        return (Math.floor(Math.abs(element.createdAt - +new Date())/1000) > 60*60*12)
    })
    for (let i = 0; i < 10; i++) {
        let random = Math.floor(Math.random() * groupJSON.waifusNotGenerated.length);
        let newWaifu = groupJSON.waifusNotGenerated[random]
        groupJSON.waifusNotGenerated.splice(random, 1)
        let photoFileInfo
        let urlData = await getWaifuData(newWaifu);
        if (typeof urlData !== 'undefined'){
            let waifuData = urlData[0]
            let photoData = urlData[1]
            for (let i = 0; i < 3; i++) {
                try {
                    photoFileInfo = await ctx.replyWithPhoto(photoData.data.data[0].path)
                    i = 5
                    console.log(waifuData.data.data.name)
                    listWaifus.push(activeWaifu(waifuData.data.data.name, ctx.chatMember, ctx.chat.id, photoFileInfo.photo[0].file_unique_id, photoData.data.data[0].path))
                } catch (error) {
                    console.log(error)
                }    
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

    
})