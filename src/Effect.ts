import * as PIXI from "pixi.js"
import { Screen } from './Screen'
import { GraphicManager } from './GraphicManager'
import { HEIGHT, WIDTH } from "./global"

export class Effect {
    private static effect_list: Effect[] = []
    private static container: PIXI.Container
    private static graph: GraphicManager
    private sprite: PIXI.AnimatedSprite
    private count: number = 0
    private constructor(private name: string, private x: number, private y: number,
        private enemy_flag: boolean, private angle: number) {
        if (!Effect.container) Effect.container = Screen.init().getContainer()
        if (!Effect.graph) Effect.graph = GraphicManager.GetInstance()
        this.sprite = Effect.graph.GetSprite(name)
        this.sprite.blendMode = PIXI.BLEND_MODES.ADD
        this.sprite.position.set(x, y)
        this.sprite.play()
        this.sprite.loop = false
        this.sprite.onComplete = () => this.remove()
        this.sprite.zIndex = 3000
        Effect.container.addChild(this.sprite)

        switch (this.name) {
            case "hit":
                this.sprite.animationSpeed = 1
                break
            case "bullet":
                this.sprite.blendMode = PIXI.BLEND_MODES.NORMAL
            case "tornado":
                this.sprite.onComplete = undefined
                this.sprite.gotoAndStop(0)
                break
            case "thunder":
                this.sprite.anchor.y = 0.8
                this.sprite.animationSpeed = 0.5
                break
            default:
                this.sprite.animationSpeed = 0.5
                break
        }
    }
    private update() {
        this.count++
        switch (this.name) {
            case "tornado":
                this.x += Math.cos(this.angle) * 5
                this.y += Math.sin(this.angle) * 5
                this.sprite.position.set(this.x, this.y)
                this.sprite.gotoAndStop(Math.floor(this.count / 5))
                if (Math.floor(this.count / 5) >= this.sprite.textures.length) this.remove()
                break
            case "bullet":
                this.x += Math.cos(this.angle) * 10
                this.y += Math.sin(this.angle) * 10
                this.sprite.position.set(this.x, this.y)
                if (this.x < 0 || this.x > WIDTH || this.y < 0 || this.y > HEIGHT) this.remove()
                break
        }
    }
    private remove() {
        Effect.container.removeChild(this.sprite)
        Effect.effect_list = Effect.effect_list.filter(n => n !== this)
    }
    public static create_effect(name: string, x: number, y: number, enemy_flag: boolean, angle: number = 0) {
        Effect.effect_list.push(new Effect(name, x, y, enemy_flag, angle))
    }
    public static update() {
        Effect.effect_list.forEach(n => n.update())
    }
    public static check_collision(x: number, y: number, enemy_flag: boolean, dam) {
        dam[0] = dam[1] = dam[2] = 0
        Effect.effect_list.forEach(n => n.collision(x, y, enemy_flag, dam))
    }
    public collision(x: number, y: number, enemy_flag: boolean, dam) {
        const dx = this.x - x, dy = this.y - y
        if (enemy_flag === this.enemy_flag) return 0
        switch (this.name) {
            case "explosion":
                if (this.count == 2 && dx * dx + dy * dy <= 50 * 50) dam[0] += 50
                break
            case "fire":
                if (this.count == 2 && dx * dx + dy * dy <= 50 * 50) dam[0] += 30
                break
            case "ice":
                if (this.count == 2 && dx * dx + dy * dy <= 50 * 50) dam[0] += 30
                break
            case "thunder":
                if (dx * dx + dy * dy <= 60 * 60) {
                    if (this.count == 1) dam[0] += 60
                    if (this.count == 6) dam[1] = 0.001
                }
                break
            case "tornado":
                if (this.count % 2 == 0 && dx * dx + dy * dy <= 50 * 50) {
                    dam[0] += 5
                    dam[1] += Math.cos(this.angle) * 3
                    dam[2] += Math.sin(this.angle) * 3
                }
                break
            case "bullet":
                if (this.count % 2 == 0 && dx * dx + dy * dy <= 10 * 10) {
                    dam[0] += 5
                    this.remove()
                }
                break
        }
        return 0
    }
}