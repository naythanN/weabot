const activeWaifu = (id, name, participant, chat, photo, url, charSeries) => {
    return {
        waifuId:   id,
        waifuName: name,
        creator:   participant,
        createdAt: +new Date(),
        chatId:    chat,
        photoId:   photo,
        photoUrl:  url,
        series:    charSeries
    }
}

export {activeWaifu};