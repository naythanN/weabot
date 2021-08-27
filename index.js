
import { Context, Markup, Telegraf} from 'telegraf'
import dotenv from "dotenv";
dotenv.config({path: './.env'})
import {getWaifuData} from './services/getChar.js'

import db from './models/index.js'


import {activeWaifu} from './services/activeChar.js'
import { range, setChatEnv } from './src/usefulFunctions.js'

import {catchCommand, rcharCommand } from './services/generationCommands.js'
import {minipatchCommand } from './services/adminCommands.js'
import { offerCommand, proposeCommand, acceptCommand } from './services/tradeCommands.js'
import {listCommand, fullListCommand, topCommand, showCommand, setPhotoCommand } from './services/listCommands.js'

const bot = new Telegraf (process.env.WAIFU)


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
        if (typeof group[0].groupInfo == "object"){
            groupJSON = group[0].groupInfo
        } else{
            groupJSON = JSON.parse(group[0].groupInfo)
        }
        
        groupJSON.transactions = []
    }
    
})

bot.use(catchCommand, rcharCommand, topCommand, showCommand, setPhotoCommand, fullListCommand, listCommand, offerCommand, proposeCommand, acceptCommand, minipatchCommand)

/* bot.command('cleanDBadmin', async (ctx) => {
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
    
}) */



bot.command('remove', async (ctx) => {
    if (ctx.from.id != 615990377){
        ctx.reply("...")
    }
    let args = ctx.update.message.text.split(" ")
    let groupJSON = await setChatEnv(ctx)
    let chatID = ctx.chat.id;
    groupJSON.users.forEach( (element) => {
        if (element.name == args[1]){
            element.waifus = element.waifus.filter(waifu => {
                if(waifu.id == args[2]){
                    return false
                }
                else{
                    return true
                }
                
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

})


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


bot.hears('hi', (ctx) => ctx.reply('Hey there'))



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

bot.command('cleanTradeGlobal', async (ctx) => {
    let groupJSON = await setChatEnv(ctx)
    let chatID = ctx.chat.id;
    ctx.reply("All trades cleaned")
    groupJSON.transactions = []

    try {
        const result = await db.Weabot.update(
            {groupInfo: JSON.stringify(groupJSON)},
            {where: {groupID: chatID}}
        )
    } catch (err){
        console.log(err)
    }
})


bot.command('patch', async (ctx) => {
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
            let counter = 0
            for ( let waifu of user.waifus ) {
                if (!waifu.hasOwnProperty('series')){
                    let waifuData
                    try {
                        waifuData = await getWaifuData(waifu.id);                    
                        waifu.series = waifuData.data.data.series.name
                         
                    } catch (error) {
                        console.log(error)
                        waifu.series = "Extra"
                    }
                    counter += 1
                    
                    if (counter % 100 == 0){
                        //await sleep(5000)
                        ctx.reply(counter)
                        try {
                            const result = await db.Weabot.update(
                                {groupInfo: JSON.stringify(groupJSON)},
                                {where: {groupID: chatID}}
                            )
                        } catch (err){
                            console.log(err)
                        }

                    }
                    
                    
                }
            }
            console.log("passei")
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
    
}).catch(err => console.log(err))



bot.launch()


/* bot.launch({
    webhook: {
        domain: process.env.URL || 'https://obscure-garden-43575.herokuapp.com/',
        port: process.env.PORT || 4000

    }
}) */