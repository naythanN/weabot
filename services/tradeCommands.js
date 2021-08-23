
import { range, setChatEnv } from '../src/usefulFunctions.js'
import {Composer} from "telegraf"
import db from '../models/index.js'

export const offerCommand = Composer.command('offer', async (ctx) => {
    let groupJSON = await setChatEnv(ctx)
    let chatID = ctx.chat.id;
    let waifus = ctx.update.message.text.split(" ")
    await  ctx.reply(`${ctx.from.first_name} is offering the following characters:  ${waifus.slice(1)}`)
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

export const proposeCommand = Composer.command('propose', async (ctx) => {
    let groupJSON = await setChatEnv(ctx)
    let chatID = await ctx.chat.id;
    let waifus = ctx.update.message.text.split(" ")
    let offer = ctx.message.reply_to_message
    if (typeof offer == "undefined"){
        ctx.reply(`You have to answer an offer`)
        return
    }
    await  ctx.reply(`${ctx.from.first_name} is proposing ${offer.from.first_name} the following characters:  ${waifus.slice(1)}`)
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

export const acceptCommand = Composer.command('accept', async (ctx) => {
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
            notUndefCreator = groupJSON.users.find(user => user.id == ctx.from.id) !== undefined
            notUndefProposal = groupJSON.users.find(user => user.id == proposal.from.id) !== undefined
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
            groupJSON.transactions = groupJSON.transactions.filter( (transaction) => {
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
    groupJSON.transactions = groupJSON.transactions.filter(element => element.creator != ctx.from.id)
    try {
        const result = await db.Weabot.update(
            {groupInfo: JSON.stringify(groupJSON)},
            {where: {groupID: chatID}}
        )
    } catch (err){
        console.log(err)
    }


})