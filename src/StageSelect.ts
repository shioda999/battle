import * as PIXI from "pixi.js"
import { Scene } from './Scene';
import { WIDTH, HEIGHT } from './global'
import { Key } from './key'
import { GraphicManager } from './GraphicManager'
import { Sound } from './Sound'
import { Obj } from "./Obj";
import { MapTip } from "./Map"
import { FileManager } from "./FileManager";
import { Field } from "./Field";
const access_num = 3
const MOVE_TIME = 50
export class StageSelect extends Scene {
    private player: PIXI.AnimatedSprite
    private base_point_graph: PIXI.Graphics
    private points: PIXI.Graphics[] = []
    private data
    private releaseFlag: boolean = false
    private key: Key
    private back_ground: PIXI.Sprite
    private points_data
    private cur_point: number = 0
    private wait_count: number = 0
    private home_button: PIXI.Graphics
    private home_button_clicked: boolean = false
    constructor(private container: PIXI.Container) {
        super()
        this.release = () => {
            this.releaseFlag = true
            Sound.stop("all")
        }
        this.key = Key.GetInstance()
        Sound.play("stageselect", true)
        this.load_points_data()
        this.set_back_ground()
        this.set_charactors()
        this.set_home_button()
        this.set_points()
        this.loop()
    }
    private loop = () => {
        if (this.releaseFlag) return
        requestAnimationFrame(this.loop)
        this.key.RenewKeyData()

        let flag: boolean = false
        if (this.home_button_clicked) {
            if (this.cur_point !== 0) flag = true
            else if (this.wait_count == 0) this.click()
            this.cur_point = 0
        }
        else {
            if (this.key.IsPress("left")) {
                this.cur_point--
                flag = true
            }
            if (this.key.IsPress("right")) {
                this.cur_point++
                flag = true
            }
        }
        this.cur_point = Math.max(0, Math.min(this.cur_point, access_num - 1))
        const tx = this.points_data[this.cur_point].pos[0] * 2
        const ty = this.points_data[this.cur_point].pos[1] * 2
        if (flag) {
            const dx = this.player.x - tx, dy = this.player.y - ty
            this.wait_count = Math.min(MOVE_TIME, Math.floor(Math.sqrt(dx * dx + dy * dy) / 3) + 1)
        }
        this.player.x += (tx - this.player.x) / (this.wait_count + 1)
        this.player.y += (ty - this.player.y) / (this.wait_count + 1)
        if (this.wait_count) this.wait_count--
    }
    private load_points_data() {
        this.points_data = FileManager.getData("map/points")
    }
    private set_points() {
        this.points_data.forEach((n, i) => {
            const p = this.copy_point_graph()
            this.points.push(p)
            const x = n.pos[0] * 2
            const y = n.pos[1] * 2
            p.position.set(x, y)
            if (i >= access_num) p.alpha = 0
            this.container.addChild(p)
        })
    }
    private copy_point_graph() {
        if (!this.base_point_graph) {
            const p = new PIXI.Graphics()
            p.lineStyle(2, 0xff0000)
            p.beginFill(0xffcc00)
            p.drawCircle(0, 0, 5)
            p.endFill()
            p.zIndex = 1
            p.alpha = 0.9
            this.base_point_graph = p
        }
        return this.base_point_graph.clone()
    }
    private set_back_ground() {
        const inst = GraphicManager.GetInstance()
        this.back_ground = inst.GetSprite("K")
        this.back_ground.anchor.set(0)
        this.back_ground.scale.set(2.0)
        this.container.addChild(this.back_ground)
        this.back_ground.interactive = true
        this.back_ground.on("pointerdown", this.click)
    }
    private set_charactors() {
        const inst = GraphicManager.GetInstance()
        this.player = inst.GetSprite("player", [0, 1, 2, 3])
        this.player.scale.set(0.8)
        this.player.animationSpeed = 0.1
        this.player.play()
        this.player.zIndex = 2
        this.player.position.set(WIDTH / 2, HEIGHT / 2)
        this.player.anchor.y = 1.1
        this.container.addChild(this.player)
    }
    private set_home_button() {
        const b = new PIXI.Graphics()
        const w = 70, h = 35
        const text = new PIXI.Text("村に帰る", new PIXI.TextStyle({
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
        b.on("pointerdown", () => this.home_button_clicked = true)
        b.position.set(WIDTH - w - 12, HEIGHT - h - 12)
        this.container.addChild(this.home_button = b)
        text.anchor.set(0.5)
        b.addChild(text)
    }
    private click = () => {
        if (this.cur_point === 0) this.gotoScene("villege")
        else {
            Field.set_cur_field_data(this.points_data[this.cur_point])
            this.gotoScene("field")
        }
    }
}