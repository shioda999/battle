import * as PIXI from "pixi.js"
import { Screen } from './Screen'

const style = new PIXI.TextStyle({
    fill: "#fbff00",
    fontSize: 15,
    lineJoin: "round",
    strokeThickness: 3
})
export class DamageText {
    private static container: PIXI.Container
    private static text_list: DamageText[] = []
    private text: PIXI.Text
    private constructor(v: number, x: number, y: number) {
        if (!DamageText.container) DamageText.container = Screen.init().getContainer()
        this.text = new PIXI.Text(v.toString(), style)
        this.text.zIndex = 4000
        this.text.anchor.set(0.5)
        this.text.position.set(x, y)
        DamageText.container.addChild(this.text)
    }
    private update() {
        this.text.alpha -= 0.05
        this.text.y -= 1
        if (this.text.alpha <= 0) this.remove()
    }
    private remove() {
        DamageText.container.removeChild(this.text)
        DamageText.text_list = DamageText.text_list.filter(n => n !== this)
    }
    public static create_text(v: number, x: number, y: number) {
        this.text_list.push(new DamageText(v, x, y))
    }
    public static update() {
        this.text_list.forEach(n => n.update())
    }
}