import { range, setChatEnv, sleep } from '../src/usefulFunctions.js'

import db from '../models/index.js'

import {getPhotoData} from '../services/getChar.js'

import _ from 'lodash'

import {Composer} from "telegraf"

export const showCommand = Composer.command('show', async (ctx) => {
    let groupJSON = await setChatEnv(ctx)
    const waifuName = ctx.update.message.text.split(" ")[1]
    const photo = ctx.update.message.text.split(" ")[2]

    let user = groupJSON.users.find(user => user.id == ctx.from.id)
    for (let waifu of user.waifus) {
        if (waifu.name.toLowerCase().includes(waifuName.toLowerCase())){
            try {
                
                if (photo === undefined){
                    if (!waifu.hasOwnProperty('mainPhoto')){
                        await ctx.replyWithPhoto({url: waifu.image}, {caption: `${waifu.name}, ${waifu.id}`})    
                    } else {
                        await ctx.replyWithPhoto({url: await getPhotoData(waifu.id, waifu.mainPhoto)}, {caption: `${waifu.name}, ${waifu.id}`})
                    }
                }
                else{
                    await ctx.replyWithPhoto({url: await getPhotoData(waifu.id, photo)}, {caption: `${waifu.name}, ${waifu.id}`})
                }
                
                
            } catch (error) {
                console.error(error)
            }
        }
        
    }

})


export const fullListCommand = Composer.command('fullList', async (ctx) => {
    let groupJSON = await setChatEnv(ctx)
    let response = ""
    let size = 0
    groupJSON.users.forEach( (element) => {
        if (element.id == ctx.from.id){
            let grouped = _.groupBy(element.waifus, (waifu) => {
                return waifu.series
            })
            
            for (const [key, value] of Object.entries(grouped)) {
                response += key + "\n\n"
                value.forEach( (waifu) => {
                    response += waifu.name + ", " + waifu.id + "\n"
                })
                response += "-------------------\n"
            }
        }
    })

    let responses = response.match(/(?=[\s\S])(?:.*\n?){1,100}/g)

    if (responses){
        for (let block of responses) {
            try {
                await ctx.reply(block)
                await sleep(500) 
            } catch (error) {
                console.error(error)
            }
        }
    }
    

})

export const listCommand = Composer.command('list', async (ctx) => {
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

export const topCommand = Composer.command('top', async (ctx) =>{
    let chatID = await ctx.chat.id;
    let topArray = []
    let groupJSON = await setChatEnv(ctx)
    groupJSON.users.forEach( (element) => {
        if (element.hasOwnProperty('name')){
            topArray.push({
                "user": element.name,
                "size": element.waifus.length
            })
        } else {
            if (element.id == ctx.from.id){
                element.name = ctx.from.first_name
                
                topArray.push({
                    "user": element.name,
                    "size": element.waifus.length
                })
            } else {
                topArray.push({
                    "user": element.id,
                    "size": element.waifus.length
                })
            } 
        }
    })

    topArray.sort((a, b) => b.size - a.size)

    let response = ""
    topArray.forEach( (element) => {
        response += element.user + ": " + element.size + "\n"
    })

    try {
        const result = await db.Weabot.update(
            {groupInfo: JSON.stringify(groupJSON)},
            {where: {groupID: chatID}}
        )
        groupJSON = await setChatEnv(ctx)
    } catch (err){
        console.log(err)
    }


    try {
        await ctx.reply(response)    
    } catch (error) {
        console.error(error)
    }

})

export const setPhotoCommand = Composer.command('setPhoto', async (ctx) =>{
    let chatID = await ctx.chat.id;
    let groupJSON = await setChatEnv(ctx)
    let waifuID = ctx.update.message.text.split(" ")[1]
    let photo = ctx.update.message.text.split(" ")[2]

    let user = groupJSON.users.find(user => user.id == ctx.from.id)

    let waifu = user.waifus.find(waifu => waifu.id == waifuID)
    waifu.mainPhoto = photo

    try {
        const result = await db.Weabot.update(
            {groupInfo: JSON.stringify(groupJSON)},
            {where: {groupID: chatID}}
        )
        groupJSON = await setChatEnv(ctx)
    } catch (err){
        console.log(err)
    }

})

