const activeWaifu = (id, name, participant, chat, photo, url) => {
    return {
        waifuId:   id,
        waifuName: name,
        creator:   participant,
        createdAt: +new Date(),
        chatId:    chat,
        photoId:   photo,
        photoUrl:  url
    }
}

export {activeWaifu};