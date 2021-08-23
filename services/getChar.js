import axios from 'axios'

const getWaifuData = async (number) => {
    const url=`https://mywaifulist.moe/api/waifu/${number}`;
    let result;
    try {
        result = await axios.get(url, {
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            }
        })
    } catch (e){
        console.error(e)
    }
    try {
        if (result.data == ''){
            console.error(`Essa deu ruim ${number}`);
            return
        }
        return result;
    } catch (e){
        console.error(e)
        console.error(`Essa deu ruim ${number}`);
    }
    
}

const getPhotoData = async (number, photo) => {
    let url
    if (photo == -1){
        url=`https://mywaifulist.moe/api/waifu/${number}`;
    } else {
        url=`https://mywaifulist.moe/api/waifu/${number}/gallery?page=0`;
    }
    
    let result;
    try {
        result = await axios.get(url, {
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            }
        })
    } catch (e){
        console.error(e)
    } finally {
        console.log(`Deu bom ${number}`);
    }
    try {
        if (result.data == ''){
            console.error(`Essa deu ruim ${number}`);
            return
        }
        if (photo == -1){
            return result.data.data.display_picture.replace("_thumb", "")
        } else {
            return result.data.data[photo].path
        }
        
    } catch (e){
        console.error(e)
        console.error(`Essa deu ruim ${number}`);
    }
    
}

export { getWaifuData, getPhotoData };