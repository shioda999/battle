import { Item } from './Item'
import * as PIXI from "pixi.js"
import { WIDTH, HEIGHT } from './global'
import { Sound } from './Sound'

const default_text_style = new PIXI.TextStyle({
    fontSize: 50,
    fill: "white"
})
export class ItemManager {
    private padding = HEIGHT / 20
    private items: Item[] = []
    private textcontainers: PIXI.Container[] = []
    private show_flag: boolean = true
    private text: string[] = []
    private styles: PIXI.TextStyle[] = []
    constructor(private sx: number, private sy: number, private width: number, private height: number, private container: PIXI.Container,
        private decide: (v: number) => any, private over: (v: number) => any, private bk_color = 0x00004B, private anchor_x = 0.5, private anchor_y = 0.5,
        private sound_decide = "decide", private sound_cancel = "back", private sound_fail = "back") {
    }
    public appendItem = (text, style = default_text_style, scale = 1.0, active = true, bk_color = this.bk_color) => {
        this.styles.push(style)
        this.text.push(text)
        const textContainer = new PIXI.Container()
        const graph = new PIXI.Graphics()
        const textdata = new PIXI.Text(text, style)
        textdata.anchor.x = 0.5
        textdata.anchor.y = 0.5
        textdata.scale.set(scale)
        textdata.name = "textdata"

        const w = this.width
        const h = this.height
        graph.beginFill(bk_color)
        graph.drawRoundedRect(-w / 2, -h / 2, w, h, h / 10);
        graph.endFill();
        graph.interactive = true
        graph.name = "graph"

        let v = this.items.length
        this.textcontainers.push(textContainer)
        textContainer.addChild(graph)
        textContainer.addChild(textdata)
        textContainer.zIndex = 2000

        let new_item = new Item(textContainer, this.container, this.items.length, WIDTH / 40)
        new_item.setActiveFlag(active)
        this.items.push(new_item)

        let H = this.items.length * (h + this.padding) - this.padding
        for (let i = 0; i < this.items.length; i++) {
            let text = this.items[i].itemContainer
            text.position.x = this.sx - w * (this.anchor_x - 0.5)
            text.position.y = this.sy - H * this.anchor_y + i * (h + this.padding) + h * 0.5
        }

        graph.on("pointerdown", () => { Sound.play(this.sound_decide, false), this.decide(v) })
        graph.on("pointerover", () => { new_item.setFocusFlag(true), this.over(v) })
        graph.on("pointerout", () => { new_item.setFocusFlag(false) })
    }
    public SetPadding(padding: number) {
        this.padding = padding
    }
    public delete() {
        this.textcontainers.forEach(n => {
            n.removeChildren()
            this.container.removeChild(n)
        })
        this.items.length = 0
    }
    public hide() {
        if (!this.show_flag) return
        this.show_flag = false
        this.items.forEach(n => this.container.removeChild(n.itemContainer))
    }
    public show() {
        if (this.show_flag) return
        this.show_flag = true
        this.items.forEach(n => this.container.addChild(n.itemContainer))
    }
    public change_str(id: number, str: string) {
        this.textcontainers[id].removeChild(this.textcontainers[id].getChildByName("textdata"))
        this.text[id] = str
        const textdata = new PIXI.Text(str, this.styles[id])
        textdata.anchor.x = 0.5
        textdata.anchor.y = 0.5
        textdata.name = "textdata"
        this.textcontainers[id].addChild(textdata)
    }
}