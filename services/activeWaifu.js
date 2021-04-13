const activeWaifu = (name, participant, chat, photo, url) => {
    return {
        waifuName: name,
        creator:   participant,
        createdAt: +new Date(),
        chatId:    chat,
        photoId:   photo,
        photoUrl:  url
    }
}

export {activeWaifu};