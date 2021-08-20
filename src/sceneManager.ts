import * as PIXI from "pixi.js"
import { Title } from './Title'
import { Key } from './key'
import { SceneType, Scene } from './Scene'
import { Fade } from './Fade'
import { GraphicManager } from './GraphicManager'
import { FileManager } from './FileManager';
import { Sound } from './Sound'
import { GRAPH_FNAME, EFFECT_FNAME, JSON_FNAME, load, SOUND_DATA, LOADED, WIDTH, HEIGHT } from './global'
import { Villege } from "./Villege"
import { Talk } from "./Talk"
import { StageSelect } from "./StageSelect"
import { Field } from "./Field"
import { Fps } from "./Fps"
const BAR_LENGTH = 300
const BAR_HEIGHT = 10
const BAR_SX = (WIDTH - BAR_LENGTH) / 2
const BAR_SY = (HEIGHT - BAR_HEIGHT) / 2
export class SceneManager {
    private key: Key
    private static instance: SceneManager
    private sceneName: SceneType[] = []
    private scene
    private text
    private bar
    private prev_time
    readonly loading_num = JSON_FNAME.length + SOUND_DATA.bgm.length + SOUND_DATA.se.length
        + GRAPH_FNAME.length + EFFECT_FNAME.length + 1
    private constructor(private container: PIXI.Container) {
        this.loading_view_init()
        LOADED.set_callback(this.loading_update)

        load()
        Scene.SetGotoSceneFunction((v) => this.gotoScene(v), this.exitCurrentScene)

        FileManager.loadFiles(JSON_FNAME)

        Sound.loadSounds(SOUND_DATA)

        const inst = GraphicManager.GetInstance()
        inst.loadGraphics(GRAPH_FNAME)
        inst.loadGraphics(EFFECT_FNAME)

        this.key = Key.GetInstance()
        this.key.key_register({ code: ["Enter", "PadA"], name: "decide" })
        this.key.key_register({ code: ["Backspace", "PadB"], name: "cancel" })
        this.key.key_register({ code: ["ArrowUp", "KeyW", "PadUp"], name: "up" })
        this.key.key_register({ code: ["ArrowDown", "KeyS", "PadDown"], name: "down" })
        this.key.key_register({ code: ["ArrowLeft", "KeyA", "PadLeft"], name: "left" })
        this.key.key_register({ code: ["ArrowRight", "KeyD", "PadRight"], name: "right" })
        this.key.key_register({ code: ["r"], name: "r" })

        const handle = setInterval(() => {
            if (LOADED.get_loaded_count() == this.loading_num) {
                this.gotoScene("villege")
                clearInterval(handle)
            }
        }, 50)

        window.addEventListener('blur', () => { Sound.pause("all") })
        window.addEventListener('focus', () => { Sound.restart("all") })
    }
    public static init(container: PIXI.Container) {
        if (!this.instance)
            this.instance = new SceneManager(container);
        return this.instance;
    }
    private exitCurrentScene = () => {
        this.sceneName.pop()
    }
    private gotoScene(name: SceneType) {
        if (name === "back") {
            name = this.sceneName.pop()
            if (this.sceneName.length > 0) name = this.sceneName.pop()
        }
        this.sceneName.push(name)
        const fade = new Fade(this.container, () => {
            this.container.removeChildren()
            if (this.scene) {
                if (this.scene.release !== undefined) this.scene.release()
                delete this.scene
            }
            this.scene = new {
                title: Title,
                villege: Villege,
                stageSelect: StageSelect,
                field: Field
            }[name](this.container)
        })
    }
    private loading_view_init() {
        const date = new Date()
        this.prev_time = date.getSeconds() * 1000 + date.getMilliseconds()
        const style = new PIXI.TextStyle({
            fill: "#00e1ff",
            fillGradientType: 1,
            fillGradientStops: [
                1,
                0
            ],
            fontFamily: "Arial Black",
            fontSize: 40,
            letterSpacing: 5,
            lineJoin: "round",
            miterLimit: 1,
            stroke: "#080042",
            strokeThickness: 11
        });
        this.text = new PIXI.Text('Loading...', style);
        this.text.anchor.set(0.5)
        this.text.position.set(WIDTH / 2, HEIGHT / 2.5)
        this.bar = new PIXI.Graphics()
        this.bar.lineStyle(2, 0xAAAAAA, 1);
        this.bar.beginFill(0)
        this.bar.drawRect(BAR_SX, BAR_SY, BAR_LENGTH, BAR_HEIGHT);
        this.bar.endFill();
        this.container.addChild(this.text)
        this.container.addChild(this.bar)
    }
    private loading_update = () => {
        const date = new Date()
        const time = date.getSeconds() * 1000 + date.getMilliseconds()
        if (time - this.prev_time > 13) {
            this.prev_time = time
            const loaded_num = LOADED.get_loaded_count()
            this.bar.lineStyle(0)
            this.bar.beginFill(0x00ff00)
            this.bar.drawRect(BAR_SX, BAR_SY, BAR_LENGTH * loaded_num / this.loading_num, BAR_HEIGHT)
            this.bar.endFill();
        }
    }
}