/**
 * 函数的实现
 */
import {
    hexToRgb
} from './lib'

class imgColorGrade {
    constructor(imgURL) {

        if (typeof imgURL !== 'string') {
            throw new Error('The parameter must be a url and a string.')
        }

        this.imgURL = imgURL

        // canvas config
        this.canvas = this.getCanvasContext()
        this.canvas = this.canvas.getContext('2d')

    }

    getCanvasContext(width = 100, height = 100) {
        const canvas = document.createElement('canvas')
        canvas.setAttribute('width', width)
        canvas.setAttribute('height', height)
        return canvas
    }

    async getColor(ignore = []) {
        const data = await this.getImageData()
        return this.getImageColorCount(data, ignore)
    }

    getImageData() {
        return new Promise((resolve, reject) => {
            this.imgObj = new Image()
            this.imgObj.src = this.imgURL

            //  错误处理
            const handleError = (error = 'The image source failed to load') => reject(new Error(error))
            imgObj.onerror = handleError
            imgObj.onabort = handleError

            //  加载完成
            this.imgObj.onload = () => {
                const {
                    width,
                    height
                } = imgObj
                this.canvas = this.getCanvasContext(width, height)
                this.ctx = this.canvas.getContext('2d')
                this.ctx.drawImage(imgObj, 0, 0, width, height)

                // resolve
                resolve(this.ctx.getImageData(0, 0, width, height))
            }
        })
    }

    getImageColorCount(data, ignore = []) {
        const colorMaps = {}
        for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3]

            // 透明度需要忽视
            if (alpha === 0) continue

            let colorArr = Array.from(data.subarray(i, i + 3))

            // 最后的数据
            if (colorArr.indexOf(undefined) > -1) continue

            const color = alpha && alpha !== 255 ?
                `rgba(${colorArr.join()},${alpha})` : `rgb(${colorArr.join()})`


            // hex 模式的颜色更改为 rgb
            ignore = ignore.map(v => {
                if (v.slice(0, 3) !== 'rgb') {
                    return hexToRgb(v)
                }
                return v
            })

            if (ignore.indexOf(color) > -1) continue

            colorMaps[color] ? colorMaps[color].count++ : (colorMaps[color] = {
                color,
                count: 1
            })

        }

        // 降序排序
        const counts = Object.values(colorMaps)
        return counts.sort((a, b) => b.count - a.count)
    }
}