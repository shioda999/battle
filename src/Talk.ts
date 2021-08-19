import * as PIXI from "pixi.js"
import { FileManager } from "./FileManager"
import { WIDTH, HEIGHT, ITEM_NAME, GLOBAL } from "./global"
import { GraphicManager } from "./GraphicManager";
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
const mouse_over_time = 300
const item_w = 30
const item_tab_w = 215
const item_tab_h = 210
const ITEM_SX = 50
const ITEM_SY = 30
const ITEM_W = item_tab_w
const ITEM_H = item_tab_h
const ITEM_DATA = [
    {
        name: "sword",
        enchant: ["atk+15"],
        price: 250
    },
    {
        name: "sword",
        enchant: ["atk+5"],
        price: 200
    },
    {
        name: "rod",
        enchant: ["atk+15"],
        price: 300
    },
]

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
    private static money: PIXI.Graphics
    private static buying: boolean = false
    private static item_tab: PIXI.Graphics
    private static item_info_box: PIXI.Graphics
    private static item_boxes: PIXI.Graphics[] = []
    private static item_sprites = new Array(144).fill({})
    private static graphic_inst
    private static mouse_over_sprite_id
    private static current_items_data = ITEM_DATA
    private static focus_frame: PIXI.Graphics
    private static selecting_item_id: number
    public static init() {
        if (!Talk.data) Talk.data = FileManager.getData("talk/talk")
        this.container = Screen.init().getContainer()
        this.graphic_inst = GraphicManager.GetInstance()
        this.set_talkContainer()
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
    private static create_rectangle(w: number, h: number, frame_w = WIDTH / 40) {
        const r = WIDTH / 64
        const graph = new PIXI.Graphics()
        graph.beginFill(0x006600, 0.8)
        graph.lineStyle(2, 0, 1)
        graph.drawRoundedRect(0, 0, w, h, r)
        graph.lineStyle(2, 0xffffff, 1)
        graph.beginFill(0x008800, 0.8)
        const k = frame_w
        graph.drawRoundedRect(k, k, w - k * 2, h - k * 2, r)
        graph.endFill()
        graph.zIndex = 1000
        return graph
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
        this.set_text(this.current_talk.default[this.talk_num = 0])
    }
    public static next() {
        if (this.graph.alpha < 1.0 || this.buying) return
        ++this.talk_num
        if (this.current_talk.default.length <= this.talk_num) {
            this.talk_end()
        }
        else this.set_text(this.current_talk.default[this.talk_num])
    }
    private static talk_end() {
        this.graph.removeChildren()
        this.graph.alpha = 0
        this.talking = false
        Screen.init().clicking = false
    }
    private static set_text(str, data = 0) {
        if (str == "sell_weapons") {
            this.create_moneyContainer()
            this.create_item_tab()
            this.buying = true
            this.money.alpha = 1
            this.item = new ItemManager(440, 350, 150, 30, this.container,
                this.no_shopping, this.over, 0x008800, 0, 0)
            this.item.appendItem("何も買わない", style, 0.5)
        }
        else if (str == "buy_check") {
            this.graph.removeChildren()
            this.selecting_item_id = data
            const price = this.current_items_data[data].price
            const text = new PIXI.Text("こちらは" + price + "ゼニーですが、\nよろしいですか？", style)
            text.scale.set(0.5)
            text.zIndex = 1000
            this.graph.addChild(text)
            text.position.set(this.text_sx, this.text_sy)
            this.set_Yes_or_No()
        }
        else {
            this.graph.removeChildren()
            const text = new PIXI.Text(str, style)
            text.scale.set(0.5)
            text.zIndex = 1000
            this.graph.addChild(text)
            text.position.set(this.text_sx, this.text_sy)
        }
    }
    private static close_item_tab() {
        if (this.item_tab) this.container.removeChild(this.item_tab)
        this.item_tab = null
    }
    private static create_item_tab() {
        if (this.item_tab) return
        const graph = this.create_rectangle(ITEM_W, ITEM_H)
        graph.position.set(ITEM_SX, ITEM_SY)
        this.item_tab = graph
        this.container.addChild(graph)
        this.create_item_boxes()
    }
    private static get_item_sprite(name: string, i: number) {
        const sprite = this.graphic_inst.GetSprite("tool", [ITEM_NAME.indexOf(name)])
        sprite.name = name
        this.add_event_to_sprite(sprite, i)
        return sprite
    }
    private static add_event_to_sprite(sprite: PIXI.Sprite, i: number) {
        sprite.interactive = true
        sprite.removeAllListeners()
        sprite.on("pointerdown", () => { this.clickSprite(sprite, i); this.close_item_info_box(sprite); })
        sprite.on("mouseover", () => this.mouse_over_sprite(sprite, i))
        sprite.on("mouseout", () => this.close_item_info_box(sprite))
    }
    public static set_items_data(data) {
        this.current_items_data = data
    }
    private static create_item_boxes() {
        const box = new PIXI.Graphics()
        box.lineStyle(2, 0)
        box.drawRect(-item_w / 2, -item_w / 2, item_w, item_w)
        box.endFill()
        const dx = item_w * 1.4
        for (let y = dx; y < item_tab_h; y += dx) {
            for (let x = dx; x < item_tab_w - dx; x += dx) {
                const b = box.clone()
                this.item_tab.addChild(b)
                b.position.set(x, y)
                this.item_boxes.push(b)
            }
        }
        const frame = new PIXI.Graphics()
        frame.lineStyle(5, 0xff0000)
        frame.drawRect(-item_w / 2, -item_w / 2, item_w, item_w)
        frame.endFill()
        frame.visible = false
        frame.zIndex = 100
        this.item_tab.addChild(this.focus_frame = frame)
        this.set_items()
    }
    private static set_items() {
        this.current_items_data.forEach((n, i) => {
            if (!n.name) return
            const sprite = this.get_item_sprite(n.name, i)
            this.item_tab.addChild(sprite)
            const x = this.item_boxes[i].x
            const y = this.item_boxes[i].y
            sprite.position.set(x, y)
            this.item_sprites[i] = sprite
        })
    }
    private static mouse_over_sprite(sprite, id) {
        this.mouse_over_sprite_id = id
        setTimeout(() => this.disp_item_info(sprite, id), mouse_over_time)
    }
    private static disp_item_info(sprite, id) {
        if (sprite.alpha === 0.5) return
        if (this.mouse_over_sprite_id === id) {
            this.create_item_info_box(sprite, id)
        }
    }
    private static set_Yes_or_No() {
        if (this.item) this.item.delete()
        this.item = new ItemManager(480, 350, 100, 25, this.container,
            this.decide, this.over, 0x008800, 0, 0)
        this.item.appendItem("はい", style, 0.5)
        this.item.appendItem("いいえ", style, 0.5)
    }
    private static close_Yes_or_No() {
        this.item.delete()
        this.item = null
    }
    private static create_item_info_box(sprite, id) {
        if (this.item_info_box) this.item_tab.removeChild(this.item_info_box)
        const box = new PIXI.Graphics()
        let enchant = this.current_items_data[id].enchant
        let str = ""
        if (enchant) {
            enchant.forEach(n => {
                str += n + "\n"
            });
        }
        const style = new PIXI.TextStyle({
            fontSize: 18,
            fill: "white"
        })
        const name = new PIXI.Text(sprite.name, style)
        const style2 = new PIXI.TextStyle({
            fontSize: 13,
            fill: "white"
        })
        const info = new PIXI.Text(str, style2)
        name.x = info.x = 15
        info.y = name.height
        box.beginFill(0)
        box.drawRect(0, 0, 100, 50)
        box.endFill()
        box.addChild(name)
        box.addChild(info)
        box.zIndex = 1000
        box.position.set(sprite.x, sprite.y)
        this.item_tab.addChild(box)
        this.item_info_box = box
    }
    private static close_item_info_box(sprite) {
        this.mouse_over_sprite_id = -1
        this.item_tab.removeChild(this.item_info_box)
    }
    public static clickSprite(sprite, i) {
        this.buying = true
        this.focus_frame.visible = true
        this.focus_frame.position.set(sprite.x, sprite.y)
        this.set_text("buy_check", i)
    }
    private static buy() {
        const id = this.selecting_item_id
        GLOBAL.money -= this.current_items_data[id].price
        this.updateMoney()
        this.container.removeChild(this.item_sprites[id])
        GLOBAL.ITEM.push(this.current_items_data[id])
        this.current_items_data[id] = { name: "", enchant: [], price: 0 }
    }
    private static decide = (v: number) => {
        if (v == 0) {
            const id = Talk.selecting_item_id
            if (GLOBAL.money >= Talk.current_items_data[id].price) {
                Talk.buy()
                Talk.set_text("まいどあり")
            }
            else {
                Talk.set_text("金がねえなら話しかけんな。貧乏人")
            }
            Talk.talk_num = -1
            setTimeout(() => Talk.buying = false, 300)
        }
        else {
            Talk.buying = false
            Talk.talk_num = -1
            Talk.next()
        }
        Talk.close_Yes_or_No()
        Talk.focus_frame.visible = false
    }
    private static no_shopping = () => {
        Talk.item.delete()
        Talk.item = null
        setTimeout(() => Talk.buying = false, 300)
        Talk.set_text(Talk.current_talk.default[++Talk.talk_num])
        Talk.close_item_tab()
        Talk.closeMoneyContainer()
    }
    private static create_moneyContainer() {
        if (this.money) return
        this.money = this.create_rectangle(200, 50, 5)
        this.money.position.set(WIDTH - 230, 256)
        this.money.alpha = 0
        this.container.addChild(this.money)
        this.updateMoney()
    }
    private static closeMoneyContainer() {
        if (this.money) this.container.removeChild(this.money)
        this.money = null
    }
    private static updateMoney() {
        this.money.removeChildren()
        const text = new PIXI.Text("所持金：" + GLOBAL.money + "Z", style)
        text.position.set(10, 10)
        text.scale.set(0.5)
        text.zIndex = 1000
        this.money.addChild(text)
    }
    private static over = (v: number) => {
    }
}