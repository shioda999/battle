import { FileManager } from "./FileManager";
import { GraphicManager } from './GraphicManager'
import { Screen } from './Screen'

const unit = 16
const passable = [
    0, 1, 2, 3, 6, 7, 10, 11,
    16, 17, 18, 19, 22, 23, 26, 27,
    34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
    50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
    64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75,
    80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91,
    96, 97, 98, 99, 103, 104, 105, 109, 110, 111,
    112, 113, 114, 115, 119, 120, 126, 127,
    130, 131, 135, 143,
    146, 147,
    160, 161, 162, 163,
    176, 177, 178, 179,
    192, 193, 194, 195, 196, 197, 198,
    208, 209, 210, 211, 212, 213, 214,
    290, 291, 294, 295, 298, 299,
    306, 307, 310, 311, 314, 315,
    320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331,
    336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347,
    352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363,
    368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379
]
export class MapTip {
    private p: number[][]
    private width: number
    private height: number
    private map
    private container
    private sprite: PIXI.Sprite[][]
    constructor(fname: string) {
        this.container = Screen.init().getContainer()
        this.load_mapdata(fname)
        this.set_mapSprites()
        this.init_p()
    }
    public fog_sprite() {
        for (let i = 0; i < this.height; i++) {
            for (let i2 = 0; i2 < this.width; i2++) {
                this.sprite[i][i2].alpha = this.p[i][i2] ? 0.5 : 1.0
            }
        }
    }
    public clear_all_p() {
        for (let i = 0; i < this.height; i++) {
            for (let i2 = 0; i2 < this.width; i2++) {
                this.p[i][i2] = 0
            }
        }
    }
    public is_out(x: number, y: number, w: number, h: number) {
        if (x < -w || y < -h
            || y >= this.height * unit
            || x >= this.width * unit) return true
        return false
    }
    public check_p(x: number, y: number, w: number, h: number, p: number) {
        for (let y2 = Math.floor(y / unit) * unit; y2 < y + h; y2 += unit) {
            for (let x2 = Math.floor(x / unit) * unit; x2 < x + w; x2 += unit) {
                const a = y2 / unit
                const b = x2 / unit
                if (a < 0 || b < 0 || a >= this.height || b >= this.width) continue
                if (this.p[a][b] !== 0 && this.p[a][b] !== p) return false
            }
        }
        return true
    }
    public set_p(x: number, y: number, w: number, h: number, p: number) {
        for (let y2 = Math.floor(y / unit) * unit; y2 < y + h; y2 += unit) {
            for (let x2 = Math.floor(x / unit) * unit; x2 < x + w; x2 += unit) {
                const a = y2 / unit
                const b = x2 / unit
                if (a < 0 || b < 0 || a >= this.height || b >= this.width) continue
                this.p[a][b] = p
            }
        }
        //this.fog_sprite()
    }
    public clear_p(x: number, y: number, w: number, h: number) {
        for (let y2 = Math.floor(y / unit) * unit; y2 < y + h; y2 += unit) {
            for (let x2 = Math.floor(x / unit) * unit; x2 < x + w; x2 += unit) {
                const a = y2 / unit
                const b = x2 / unit
                if (a < 0 || b < 0 || a >= this.height || b >= this.width) continue
                this.p[a][b] = 0
            }
        }
    }
    private init_p() {
        this.p = new Array(this.height)
        for (let i = 0; i < this.height; i++) {
            this.p[i] = new Array(this.width).fill(3)
        }
        for (let i = 0; i < this.height; i++) {
            for (let i2 = 0; i2 < this.width; i2++) {
                if (passable.indexOf(this.map[i][i2]) !== -1)
                    this.p[i][i2] = 0
            }
        }
    }
    private load_mapdata(fname: string) {
        const data = FileManager.getData("map/" + fname)
        this.width = data.width
        this.height = data.height
        this.map = data.id
    }
    private set_mapSprites() {
        const unit = 16
        const inst = GraphicManager.GetInstance()
        this.sprite = new Array(this.height)
        for (let i = 0; i < this.height; i++) {
            this.sprite[i] = new Array(this.width)
            for (let i2 = 0; i2 < this.width; i2++) {
                const sprite = inst.GetSprite("map", [this.map[i][i2]])
                sprite.anchor.set(0)
                sprite.position.set(unit * i2, unit * i)
                this.container.addChild(sprite)
                this.sprite[i][i2] = sprite
            }
        }
    }
    public delete_mapSprites() {
        this.sprite.forEach((row) => {
            row.forEach((s) => {
                if (s) s.destroy()
            })
        })
    }
}