import * as PIXI from "pixi.js"
import { FileManager } from "./FileManager"
import { WIDTH, HEIGHT } from "./global"
import { ItemManager } from "./ItemManager";
import { Screen } from './Screen'

const style = new PIXI.TextStyle({
    fill: "white",
    fontSize: 44,
    lineJoin: "round",
    miterLimit: 1,
    strokeThickness: 5
});
const item_num = 10

export class Talk {
    private static data
    private static current_talk
    private static talk_num: number = 0
    public static talking: boolean = false
    private static graph: PIXI.Graphics
    private static container: PIXI.Container
    private static text_sx: number
    private static text_sy: number
    private static mapname: string
    private static item: ItemManager
    private static detail: PIXI.Graphics
    private static money: PIXI.Graphics
    private static buying: boolean = false
    public static init() {
        if (!Talk.data) Talk.data = FileManager.getData("talk/talk")
        this.container = Screen.init().getContainer()
        this.set_talkContainer()
        this.set_detailContainer()
        this.set_moneyContainer()
        this.item = new ItemManager(50, 50, WIDTH / 4, 30, this.container,
            this.decide, this.over, 0x008800, 0, 0)
    }
    private static set_talkContainer() {
        const sx = WIDTH / 64
        const w = WIDTH - sx * 2, h = HEIGHT / 3.5
        const sy = HEIGHT - h * 1.2
        const k = WIDTH / 40
        this.text_sx = k * 2
        this.text_sy = k * 2
        const graph = this.create_rectangle(w, h)
        graph.position.set(sx, sy)
        graph.zIndex = 1000
        graph.alpha = 0
        graph.interactive = true
        Talk.graph = graph
        this.container.addChild(graph)
        this.container.on("pointerup", () => this.next())
    }
    private static create_rectangle(w: number, h: number) {
        const r = WIDTH / 64
        const graph = new PIXI.Graphics()
        graph.beginFill(0x006600, 0.8)
        graph.lineStyle(2, 0, 1)
        graph.drawRoundedRect(0, 0, w, h, r)
        graph.lineStyle(2, 0xffffff, 1)
        graph.beginFill(0x008800, 0.8)
        const k = WIDTH / 40
        graph.drawRoundedRect(k, k, w - k * 2, h - k * 2, r)
        graph.endFill()
        this.text_sx = k * 2
        this.text_sy = k * 2
        graph.zIndex = 1000
        return graph
    }
    private static set_detailContainer() {
        this.detail = this.create_rectangle(WIDTH / 2, HEIGHT / 2.5)
        this.detail.position.set(WIDTH / 2 - 40, 50)
        this.detail.alpha = 0
        this.container.addChild(this.detail)
    }
    private static set_moneyContainer() {
        const graph = new PIXI.Graphics()
        graph.beginFill(0x008800, 1)
        graph.lineStyle(2, 0, 1)
        graph.drawRoundedRect(0, 0, 100, 40, WIDTH / 64)
        graph.endFill()
        this.money = graph
        this.money.position.set(WIDTH * 0.8, 256)
        this.money.alpha = 0
        this.container.addChild(this.money)
    }
    public static set_current_mapname(name: string) {
        this.mapname = name
    }
    public static talk(name: string) {
        const data = this.data[this.mapname][name]
        const inst = setInterval(() => {
            this.graph.alpha += 0.1
            if (this.graph.alpha >= 1.0) clearInterval(inst)
        }, 16)
        this.current_talk = data
        this.talking = true
        this.load_text(this.talk_num = 0)
    }
    public static next() {
        if (this.graph.alpha < 1.0 || this.buying) return
        ++this.talk_num
        if (this.current_talk.default.length == this.talk_num) {
            this.graph.removeChildren()
            this.graph.alpha = 0
            this.talking = false
            Screen.init().clicking = false
            return
        }
        else this.load_text(this.talk_num)
    }
    private static load_text(num: number) {
        if (this.current_talk.default[num] == "weapone") {
            this.buying = true
            this.item.appendItem("aaa", style, 0.5)
            this.item.appendItem("bbb", style, 0.5)
            this.item.appendItem("戻る", style, 0.5)
            this.money.alpha = this.detail.alpha = 1
        }
        else {
            this.graph.removeChildren()
            const text = new PIXI.Text(this.current_talk.default[num], style)
            text.scale.set(0.5)
            text.zIndex = 1000
            this.graph.addChild(text)
            text.position.set(this.text_sx, this.text_sy)
        }
    }
    public static buy(list) {

    }
    private static decide = (v: number) => {
        if (v == 2) {
            Talk.money.alpha = Talk.detail.alpha = 0
            Talk.buying = false
            Talk.item.delete()
            Talk.next()
        }
    }
    private static over = (v: number) => {

    }
}