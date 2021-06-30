import * as PIXI from "pixi.js"
import { Screen } from './Screen';
import { WIDTH } from './global'
const FPS_UPDATE_FREQ = 20
export class Fps {
    private static curTime: number
    private static prevTime: number
    private static countFrame: number = 0
    private static fpsContainer: PIXI.Container
    private static fpsText: PIXI.Text
    private static fpsBox: PIXI.Graphics
    public static init(container) {
        if (this.fpsContainer) return
        this.fpsContainer = new PIXI.Container()
        this.fpsContainer.zIndex = 10000
        container.addChild(this.fpsContainer)
    }
    public static update() {
        if (!this.fpsContainer) return
        if (this.countFrame % FPS_UPDATE_FREQ === 0) {
            this.prevTime = this.curTime
            this.curTime = new Date().getTime()
            this.updateContainer(this.curTime - this.prevTime)
        }
        this.countFrame++
    }
    private static orgRound(value, base) {
        return Math.round(value * base) / base;
    }
    private static updateContainer(delta: number) {
        if (this.fpsText) {
            this.fpsContainer.removeChild(this.fpsText)
            this.fpsText.destroy()
        }
        this.fpsText = new PIXI.Text("FPS:" + this.orgRound(1000 * FPS_UPDATE_FREQ / delta, 100).toFixed(2), {
            fontFamily: "Arial", fontSize: WIDTH / 30, fill: 0xdddddd
        })
        this.fpsText.zIndex = 10000
        console.log(this.orgRound(1000 * FPS_UPDATE_FREQ / delta, 100).toFixed(2))
        if (!this.fpsBox) {
            this.fpsBox = new PIXI.Graphics()
            this.fpsBox.lineStyle(2, 0xcccccc, 1, 1.0)
            this.fpsBox.beginFill(0x0000ff, 0.3)
            this.fpsBox.drawRect(0, 0, this.fpsText.width, this.fpsText.height)
            this.fpsBox.endFill()
            this.fpsContainer.addChild(this.fpsBox)
            //this.fpsContainer.x = WIDTH - this.fpsText.width - 3
            //this.fpsContainer.y = 3
        }
        this.fpsContainer.addChild(this.fpsText)
    }
}
