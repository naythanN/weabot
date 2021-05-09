import { Context, Markup, Telegraf} from 'telegraf'
import dotenv from "dotenv";
dotenv.config({path: './.env'})
import {getWaifuData} from './services/getWaifu.js'

import db from './models/index.js';


import {activeWaifu} from './services/activeWaifu.js'

function range(start, end) {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start)
}

const bot = new Telegraf (process.env.WAIFU)


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


bot.start( async (ctx) => {
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
        if (typeof group[0].groupInfo == "object"){
            groupJSON = group[0].groupInfo
        } else{
            groupJSON = JSON.parse(group[0].groupInfo)
        }
        
        groupJSON.transactions = []
    }
    
})

bot.command('cleanDBadmin', async (ctx) => {
    if (ctx.from.id != 615990377){
        return
    }
    ctx.reply('Welcome')
    db.Weabot.destroy({truncate: true})
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
        groupJSON.transactions = []
    }
    
})

bot.command('patch', async (ctx) => {
    if (ctx.from.id != 615990377){
        ctx.reply("Vai se fuder sua puta :)")
        return
    } else{
        ctx.reply("Patch applied successfully")
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
        if (groupJSON.hasOwnProperty("activeWaifus")){
            console.log("nice")
        }
        else{
            groupJSON.activeWaifus = []
        }
        
        let notGenerated = range(1, 36000)
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
    }
    
})


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


bot.hears('hi', (ctx) => ctx.reply('Hey there'))


bot.command('show', async (ctx) => {
    let groupJSON = await setChatEnv(ctx)
    const waifuName = ctx.update.message.text.split(" ")[1]
    groupJSON.users.forEach( (user) => {
        if (user.id == ctx.from.id){
            user.waifus.forEach( async (waifu) => {
                if (waifu.name.toLowerCase().includes(waifuName.toLowerCase())){
                    try {
                        await ctx.replyWithPhoto({url: waifu.image}, {caption: `${waifu.name}, ${waifu.id}`})    
                    } catch (error) {
                        console.error(error)
                    }
                }
                
            })
        }
    })

})

bot.command('cleanTrade', async (ctx) => {
    let groupJSON = await setChatEnv(ctx)
    let chatID = ctx.chat.id;
    groupJSON.transactions.filter( (transaction) => {
        return (transaction.creator != ctx.from.id)
    })

    try {
        const result = await db.Weabot.update(
            {groupInfo: JSON.stringify(groupJSON)},
            {where: {groupID: chatID}}
        )
    } catch (err){
        console.log(err)
    }
})

bot.command('fullList', async (ctx) => {
    let groupJSON = await setChatEnv(ctx)
    let response = ""
    groupJSON.users.forEach( (element) => {
        if (element.id == ctx.from.id){
            element.waifus.forEach( async (waifu) => {
                response += waifu.name + ", " + waifu.id + "\n"
            })
        }
    })

    try {
        await ctx.reply(response)    
    } catch (error) {
        console.error(error)
    }

})

bot.command('list', async (ctx) => {
    let groupJSON = await setChatEnv(ctx)
    let response = ""
    groupJSON.users.forEach( (element) => {
        if (element.id == ctx.from.id){

            for (let index = element.waifus.length - 1; index > element.waifus.length - 20 && index >= 0; index--) {

                response += element.waifus[index].name + ", " + element.waifus[index].id + "\n"
                
            }
        }
    })

    try {
        await ctx.reply(response)    
    } catch (error) {
        console.error(error)
    }

})

bot.command('top', async (ctx) =>{

    let topArray = []
    let groupJSON = await setChatEnv(ctx)
    groupJSON.users.forEach( (element) => {
        topArray.push({
            "user": element.id,
            "size": element.waifus.length
        })
    })

    topArray.sort((a, b) => b.size - a.size)

    let response = ""
    topArray.forEach( (element) => {
        response += element.user + ": " + element.size + "\n"
    })


    try {
        await ctx.reply(response)    
    } catch (error) {
        console.error(error)
    }

})


bot.command('offer', async (ctx) => {
    let groupJSON = await setChatEnv(ctx)
    let chatID = ctx.chat.id;
    let waifus = ctx.update.message.text.split(" ")
    await  ctx.reply(`${ctx.from.first_name} is offering the following waifus:  ${waifus.slice(1)}`)
    groupJSON.transactions.push({
        "creator": ctx.from.id,
        "waifusOffered": waifus.slice(1).map(Number),
        "target": "",
        "waifusProposed": []
    })

    try {
        const result = await db.Weabot.update(
            {groupInfo: JSON.stringify(groupJSON)},
            {where: {groupID: chatID}}
        )
    } catch (err){
        console.log(err)
    }

})

bot.command('propose', async (ctx) => {
    let groupJSON = await setChatEnv(ctx)
    let chatID = await ctx.chat.id;
    let waifus = ctx.update.message.text.split(" ")
    let offer = ctx.message.reply_to_message
    if (typeof offer == "undefined"){
        ctx.reply(`You have to answer an offer`)
        return
    }
    await  ctx.reply(`${ctx.from.first_name} is proposing ${offer.from.first_name} the following waifus:  ${waifus.slice(1)}`)
    groupJSON.transactions.forEach( (element) => {
        if (element.creator == offer.from.id){
            element.target = ctx.from.id
            element.waifusProposed = waifus.slice(1).map(Number)
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
})

bot.command('accept', async (ctx) => {
    let chatID = await ctx.chat.id;
    let groupJSON = await setChatEnv(ctx)
    let proposal = ctx.message.reply_to_message
    await  ctx.reply(`${ctx.from.first_name} is accepting ${proposal.from.first_name}'s proposal`)

    let transaction = groupJSON.transactions.find(element => element.creator == ctx.from.id)
    if (transaction.creator == ctx.from.id){

        let checkCreator
        let checkProposer
        let notUndefCreator
        let notUndefProposal

        try {
            checkCreator = transaction.waifusOffered.every(val => groupJSON.users.find(user => user.id == ctx.from.id).waifus.map(element => element.id).includes(val))
            checkProposer = transaction.waifusProposed.every(val => groupJSON.users.find(user => user.id == proposal.from.id).waifus.map(element => element.id).includes(val))
            notUndefCreator = groupJSON.users.find(user => user.id == ctx.from.id) != "undefined"
            notUndefProposal = groupJSON.users.find(user => user.id == proposal.from.id) != "undefined"            
        } catch (error) {
            console.log(error)
            return
        }


        if (checkCreator == false || checkProposer == false || notUndefCreator == false || notUndefProposal == false){
            await  ctx.reply(`This trade is invalid`)
            console.log(checkCreator)
            console.log(checkProposer)
            console.log(notUndefCreator)
            console.log(notUndefProposal)
            groupJSON.transactions.filter( (transaction) => {
                return (transaction.creator != ctx.from.id)
            })
        
            try {
                const result = await db.Weabot.update(
                    {groupInfo: JSON.stringify(groupJSON)},
                    {where: {groupID: chatID}}
                )
            } catch (err){
                console.log(err)
            }
            return
        } else{
            await  ctx.reply(`This trade is valid`)
        }
        groupJSON.users.forEach( (user) => {
            if (user.id == transaction.creator){
                user.waifus.forEach( (waifu, index, waifus) =>{
                    if (transaction.waifusOffered.includes(waifu.id)){
                        let proposer = groupJSON.users.find(user => user.id == proposal.from.id)
                        proposer.waifus.push(waifu)
                        waifus.splice(index, 1)
                        
                    }
                    
                })
            }
            if (user.id == proposal.from.id){
                user.waifus.forEach( (waifu, index, waifus) =>{
                    if (transaction.waifusProposed.includes(waifu.id)){
                        let creator = groupJSON.users.find(user => user.id == ctx.from.id)
                        creator.waifus.push(waifu)
                        waifus.splice(index, 1)
                        
                    }
                    
                })
            }
        })
    }
    groupJSON.transactions.filter(element => element.creator != ctx.from.id)
    try {
        const result = await db.Weabot.update(
            {groupInfo: JSON.stringify(groupJSON)},
            {where: {groupID: chatID}}
        )
    } catch (err){
        console.log(err)
    }


})


bot.command('catch', async (ctx) => {
    let chatID = await ctx.chat.id;
    let groupJSON = await setChatEnv(ctx)
    const ids = groupJSON.users.map(a => a.id)

    if (ids.includes(ctx.from.id)){
        console.log(`${ctx.from.first_name} is trying to catch this waifu`)
    }else{
        ctx.reply(`${ctx.from.first_name} is trying to catch a waifu for the first time`)
        groupJSON.users.push({
            "id": ctx.from.id,
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
        const waifuActive = groupJSON.activeWaifus.find(element => element.photoId == waifu.photo[0].file_unique_id)

        if (typeof waifuActive === 'undefined' || typeof waifuName === 'undefined'){
            ctx.reply("This waifu isnt currently active or is not a waifu at all. Or... you should at least pass a name")
        } else{
            if (waifuActive.waifuName.toLowerCase().split(" ").includes(waifuName.toLowerCase()) || waifuActive.waifuName.toLowerCase() == waifuName.toLowerCase()){
                ctx.reply("You got the waifu, nice")
                groupJSON.activeWaifus = groupJSON.activeWaifus.filter(waifu => {
                    return (waifu.waifuName != waifuActive.waifuName)
                })
                groupJSON.waifusCaptured.push(waifuActive.waifuName)
                groupJSON.users.forEach( (element) => {
                    if (element.id === ctx.from.id){
                        element.waifus.push({
                            "name":  waifuActive.waifuName,
                            "id":    waifuActive.waifuId,
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
                ctx.reply("Baka :), wrong waifu name.")
            }
        }
    }
    
})

bot.command('rwaifu', async (ctx) => {
    let chatID = await ctx.chat.id;
    let groupJSON = await setChatEnv(ctx)
    const ids = groupJSON.users.map(a => a.id)

    if (ids.includes(ctx.from.id)){
        let user = groupJSON.users.find(element => element.id == ctx.from.id)
        if (Math.floor(Math.abs(+new Date() - user.lastRwaifu))/1000 < 60*60){
            ctx.reply(`${ctx.from.first_name} Already used their rwaifu, ${new Date(user.lastRwaifu)}`)
            return
        } else{
            ctx.reply(`${ctx.from.first_name} Generated some waifus`)
            user.lastRwaifu = +new Date()
        }
        
    }else{
        ctx.reply(`${ctx.from.first_name} Generated 10 waifus for the first time`)
        groupJSON.users.push({
            "id": ctx.from.id,
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

    groupJSON.activeWaifus = groupJSON.activeWaifus.filter(element => {
        if (Math.floor(Math.abs(element.createdAt - +new Date())/1000) > 60*60*12){
            groupJSON.waifusDead.push(element.waifuId)
            return false
        }
        return true
    })

    if (groupJSON.waifusNotGenerated.length % 3000 == 0){
        let waifuReturn = groupJSON.waifusDead.splice(0, 1500)
        groupJSON.waifusNotGenerated.push(...waifuReturn)
    }

    if (groupJSON.waifusNotGenerated.length < 3000){
        let waifuReturn = groupJSON.waifusDead.splice(0, 15000)
        groupJSON.waifusNotGenerated.push(...waifuReturn)
    }

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
                    

                    let re = /["'(),]/gi
                    let correctWaifuName = waifuData.data.data.name.replace(re, "")

                    groupJSON.activeWaifus.push(activeWaifu(newWaifu, correctWaifuName, ctx.chatMember, ctx.chat.id, photoFileInfo.photo[0].file_unique_id, photoData.data.data[0].path))
                    try {
                        const result = await db.Weabot.update(
                            {groupInfo: JSON.stringify(groupJSON)},
                            {where: {groupID: chatID}}
                        )
                    } catch (err){
                        console.log(err)
                    }
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


/* bot.launch()
 */
bot.launch({
    webhook: {
        domain: process.env.URL || 'https://obscure-garden-43575.herokuapp.com/',
        port: process.env.PORT || 4000

    }
})