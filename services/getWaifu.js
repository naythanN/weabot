import axios from 'axios'

const getWaifuData = async (number) => {
    const url=`https://mywaifulist.moe/api/waifu/${number}`;
    const urlPhoto=`https://mywaifulist.moe/api/waifu/${number}/gallery?page=0`;
    let result, resultPhoto;
    try {
        result = await axios.get(url, {
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            }
        })

        resultPhoto = await axios.get(urlPhoto, {
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
            return
        }
        const resp = [
            result,
            resultPhoto
        ]
        return resp;
    } catch (e){
        console.error(e)
        console.error(`Essa deu ruim ${number}`);
    }
    
    /* .catch(error => {
        console.log(error);
    }) */
}
export { getWaifuData };