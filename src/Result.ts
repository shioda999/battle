import * as PIXI from 'pixi.js'
import { HEIGHT, GLOBAL, WIDTH } from './global'
const box_w = WIDTH * 0.7
const box_h = HEIGHT * 0.7
const margin = 10
const button_w = (box_w - margin * 2) / 2 - 8
const button_h = HEIGHT * 0.09
const button_x = (box_w - margin * 2) / 4
const button_y = box_h / 2 - button_h / 2 - margin - 4
export class Result {
    private static box: PIXI.Graphics
    private static item_list
    private static container: PIXI.Container
    private static next_button: PIXI.Graphics
    private static return_button: PIXI.Graphics
    private static return_callback: () => any
    private static next_callback: () => any
    private static text: PIXI.Text
    public static init(container, return_callback, next_callback) {
        if (this.container) return
        this.container = container
        this.return_callback = return_callback
        this.next_callback = next_callback
        const box = new PIXI.Graphics()
        box.lineStyle(2, 0)
        box.beginFill(0xaaaaaa)
        box.drawRoundedRect(-box_w / 2, -box_h / 2, box_w, box_h, 10)
        box.lineStyle(2, 0xffffff)
        box.drawRoundedRect(margin - box_w / 2, margin - box_h / 2,
            box_w - margin * 2, box_h - margin * 2, 10)
        box.endFill()
        box.zIndex = 10000
        this.box = box
        box.position.set(WIDTH * 0.5, HEIGHT * 0.5)
        this.create_buttons()
    }
    public static show(win: boolean, new_item) {
        if (this.text) this.box.removeChild(this.text)
        this.container.addChild(this.box)
        let text: PIXI.Text
        let color: number
        let str: string
        if (win) {
            color = 0x0000dd
            str = "勝利"
        }
        else {
            color = 0xdd0000
            str = "敗北"
        }
        const style = new PIXI.TextStyle({
            fontSize: 40,
            fill: color,
            strokeThickness: 3
        })
        text = new PIXI.Text(str, style)
        text.anchor.x = 0.5
        text.y = -box_h / 2
        this.text = text
        this.box.addChild(text)
    }
    public static hide() {
        this.container.removeChild(this.box)
    }
    private static create_buttons() {
        const style = new PIXI.TextStyle({
            fontSize: 25,
            fill: 0xdddddd,
            fontWeight: "bold"
        })
        const b = new PIXI.Graphics()
        b.lineStyle(1, 0)
        b.beginFill(0xaaaaaa)
        b.drawRect(-button_w / 2, -button_h / 2, button_w, button_h)
        b.endFill()
        b.position.set(-button_x, button_y)
        const t = new PIXI.Text("村に帰る", style)
        t.anchor.set(0.5)
        b.addChild(t)
        b.interactive = true
        b.tint = 0xdddddd
        b.on("pointerup", this.return_callback)
        b.on("mouseover", () => b.tint = 0xffffff)
        b.on("mouseout", () => b.tint = 0xdddddd)
        const b2 = new PIXI.Graphics()
        b2.lineStyle(1, 0)
        b2.beginFill(0xaaaaaa)
        b2.drawRect(-button_w / 2, -button_h / 2, button_w, button_h)
        b2.endFill()
        b2.position.set(button_x, button_y)
        const t2 = new PIXI.Text("探索続行", style)
        t2.anchor.set(0.5)
        b2.addChild(t2)
        b2.interactive = true
        b2.tint = 0xdddddd
        b2.on("pointerup", this.next_callback)
        b2.on("mouseover", () => b2.tint = 0xffffff)
        b2.on("mouseout", () => b2.tint = 0xdddddd)
        this.box.addChild(b)
        this.box.addChild(b2)
    }
}