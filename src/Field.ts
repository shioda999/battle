import * as PIXI from "pixi.js"
import { Scene } from './Scene';
import { WIDTH, HEIGHT, GLOBAL, ENEMY_STATUS } from './global'
import { Sound } from './Sound'
import { Obj } from "./Obj";
import { MapTip } from "./Map"
import { Fps } from "./Fps";
import { Result } from "./Result";
import { GraphicManager } from "./GraphicManager";
export class Field extends Scene {
    private releaseFlag: boolean = false
    private map: MapTip
    private static result_mode: boolean = false
    private static cur_field_data
    private static cur_instance: Field
    private static speed = 2
    constructor(private container: PIXI.Container) {
        super()
        Field.cur_instance = this
        Field.result_mode = false
        this.map = new MapTip("field")
        Obj.set_current_map(this.map)
        this.release = () => {
            this.releaseFlag = true
            this.map.delete_mapSprites()
            Obj.destroy()
            Sound.stop("all")
        }
        this.set_charactors()
        Sound.play(Field.cur_field_data.bgm, true)

        Result.init(this.container, () => Field.return_button_click(), () => Field.next_button_click())

        const inst = GraphicManager.GetInstance()
        inst.SetLoadedFunc(() => {
            this.loop()
        })
    }
    private loop = () => {
        if (this.releaseFlag) return
        if (Field.result_mode) return
        requestAnimationFrame(this.loop)
        for (let i = 0; i < Field.speed; i++) {
            Obj.update()
            Fps.update()
            let str = Obj.end()
            if (str) {
                Field.result_mode = true
                setTimeout(() => Result.show(str === "win", []), 500)
            }
        }
    }
    public static set_cur_field_data(cur_field_data) {
        Field.cur_field_data = cur_field_data
    }
    private set_charactors() {
        Obj.removeSprites()
        Obj.destroy()
        this.set_enemys()
        GLOBAL.FORMATION.forEach(n => {
            if (n.set) Obj.create_obj(this.container, n.name, false, "fight", n.x * 32, n.y * 32 + (HEIGHT - 320) / 2,
                n.data)
        })
    }
    private static next_button_click() {
        Result.hide()
        Field.result_mode = false
        Field.cur_instance.set_charactors()
        Field.cur_instance.loop()
    }
    private static return_button_click() {
        Result.hide()
        Field.cur_instance.gotoScene("villege")
    }
    private set_enemys() {
        let array = new Array(100)
        let data = Field.cur_field_data
        let v = Math.random(), sum = 0, enemys
        for (let i = 0; i < 100; i++)array[i] = i
        for (let i = 0; i < data.enemy_pattern.length; i++) {
            sum += data.enemy_pattern[i].p
            if (v <= sum) {
                enemys = data.enemy_pattern[i].enemys
            }
        }
        enemys.forEach(n => {
            let num_str = n.num.split(",")
            v = Math.random() * num_str.length
            let num = parseInt(num_str[Math.floor(v)])
            for (let i = 0; i < num; i++) {
                let pos = array[Math.floor(Math.random() * array.length)]
                let x = pos % 10 * 16 + WIDTH - 160
                let y = Math.floor(pos / 10) * 32 + (HEIGHT - 320) / 2
                Obj.create_obj(this.container, n.name, true, "fight", x, y, ENEMY_STATUS[n.name])
                array = array.filter(n2 => n2 != pos)
            }
        })
    }
}