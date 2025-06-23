/**
 * 资源文件
 * 把模型和图片分开进行加载
 */
import {getSrcPath} from "@/utils/util";

interface ITextures {
    name: string
    url: string
}

export interface IResources {
    textures?: ITextures[],
}

const filePath = 'components/SystemComponents/30602/3060220009/SystemTechnologyEarth/images/earth/'
const fileSuffix = [
    'gradient',
    'redCircle',
    "label",
    "aperture",
    'glow',
    'light_column',
    'aircraft'
]

const textures = fileSuffix.map(item => {
    return {
        name: item,
        url:getSrcPath(filePath + item + '.png')
    }
})

textures.push({
    name: 'earth',
    url: getSrcPath(filePath + 'earth.jpg')
})

const resources: IResources = {
    textures
}


export {
    resources
}