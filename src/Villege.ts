import * as PIXI from "pixi.js"
import { Scene } from './Scene';
import { WIDTH, HEIGHT, GLOBAL } from './global'
import { Key } from './key'
import { GraphicManager } from './GraphicManager'
import { Sound } from './Sound'
import { Obj } from "./Obj";
import { MapTip } from "./Map"
import { Talk } from "./Talk";
import { Menu } from "./Menu";
import { Fps } from "./Fps";
const text_style = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 16,
    fill: [0xffffff]
})
export class Villege extends Scene {
    private key: Key
    private releaseFlag: boolean = false
    //private background: BackGround
    private map: MapTip
    private menu_button: PIXI.Graphics
    constructor(private container: PIXI.Container) {
        super()
        this.map = new MapTip("villege")
        Obj.set_current_map(this.map, true)
        this.release = () => {
            this.releaseFlag = true
            this.map.delete_mapSprites()
            Sound.stop("all")
        }
        this.set_charactors()

        const inst = GraphicManager.GetInstance()
        Sound.stop("villege")
        Sound.play("villege", true)
        Talk.init()
        Talk.set_current_mapname("villege")
        Menu.init(this.container)

        this.set_menu_button()
        this.key = Key.GetInstance()
        this.loop()
    }
    private set_menu_button() {
        const b = new PIXI.Graphics()
        const w = 70, h = 35
        const text = new PIXI.Text("装備変更", new PIXI.TextStyle({
            fontSize: 25,
            fill: "white"
        }))
        b.beginFill(0x888888, 1)
        b.lineStyle(5, 0)
        b.drawEllipse(0, 0, w, h)
        b.endFill()
        b.alpha = 0.5
        b.interactive = true
        b.on("pointerover", () => b.alpha = 1)
        b.on("pointerout", () => b.alpha = 0.5)
        b.on("pointerup", () => {
            if (Menu.show_flag) {
                Menu.hide()
            }
            else {
                Menu.show()
            }
        })
        b.position.set(WIDTH - w - 12, HEIGHT - h - 12)
        b.zIndex = 10000
        this.container.addChild(this.menu_button = b)
        text.anchor.set(0.5)
        b.addChild(text)
        this.menu_button = b
    }
    private set_charactors() {
        Obj.create_obj(this.container, "player", false, "normal", WIDTH / 2, HEIGHT / 2, {})
        Obj.create_obj(this.container, "merchant", true, "normal", 448, 232, { name: "bukiya" })
        Obj.create_obj(this.container, "merchant", true, "normal", 48, 152, { name: "sakaya" })
        Obj.create_obj(this.container, "merchant", true, "normal", 144, 456, { name: "douguya" })
        Obj.create_obj(this.container, "merchant", true, "normal", 288, 152, { name: "tueya" })
    }
    private loop = () => {
        if (this.releaseFlag) return
        requestAnimationFrame(this.loop)
        this.key.RenewKeyData()
        Fps.update()
        if (GLOBAL.pause_flag) return
        if (Menu.show_flag) {
            Menu.update()
        }
        else {
            this.obj_update()
            this.deal_change_Scene()
        }
        if (Talk.talking) {
            this.menu_button.visible = false
        }
        else this.menu_button.visible = true
    }
    private deal_change_Scene() {
        if (Obj.go_out_flag) {
            Obj.go_out_flag = false
            Obj.destroy()
            this.gotoScene("stageSelect")
        }
    }
    private obj_update() {
        Obj.update()
    }
}