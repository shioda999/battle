import * as PIXI from "pixi.js"
import { Title } from './Title'
import { Key } from './key'
import { SceneType, Scene } from './Scene'
import { Fade } from './Fade'
import { GraphicManager } from './GraphicManager'
import { FileManager } from './FileManager';
import { Sound } from './Sound'
import { GRAPH_FNAME, EFFECT_FNAME, JSON_FNAME, load } from './global'
import { Villege } from "./Villege"
import { Talk } from "./Talk"
import { StageSelect } from "./StageSelect"
import { Field } from "./Field"
import { Fps } from "./Fps"
export class SceneManager {
    private key: Key
    private static instance: SceneManager
    private sceneName: SceneType[] = []
    private scene
    private graphic_loaded: boolean = false
    private file_loaded: boolean = false
    private constructor(private container: PIXI.Container) {
        load()
        Scene.SetGotoSceneFunction((v) => this.gotoScene(v), this.exitCurrentScene)

        FileManager.loadFiles(JSON_FNAME)

        Sound.load("sound\\bgm.mp3", "bgm", "bgm")
        Sound.load("sound\\villege.mp3", "villege", "bgm")
        Sound.load("sound\\stageselect.mp3", "stageselect", "bgm")
        Sound.load("sound\\dangeon.mp3", "dangeon", "bgm")
        Sound.load("sound\\dangeon2.mp3", "dangeon2", "bgm")
        Sound.load("sound\\dangeon3.mp3", "dangeon3", "bgm")
        Sound.load("sound\\dangeon4.mp3", "dangeon4", "bgm")
        Sound.load("sound\\dangeon5.mp3", "dangeon5", "bgm")
        Sound.load("sound\\dangeon6.mp3", "dangeon6", "bgm")
        Sound.load("sound\\boo.mp3", "boo", "se")
        Sound.load("sound\\jump.mp3", "jump", "se")
        Sound.load("sound\\fall.mp3", "fall", "se")
        Sound.load("sound\\damage.mp3", "damage", "se")
        Sound.load("sound\\decide.mp3", "decide", "se")
        Sound.load("sound\\back.mp3", "back", "se")
        Sound.load("sound\\game_over.mp3", "over", "se")

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

        inst.SetLoadedFunc(() => this.graphic_loaded = true)
        FileManager.SetLoadedFunc(() => this.file_loaded = true)

        const handle = setInterval(() => {
            if (this.graphic_loaded && this.file_loaded) {
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
        if (this.scene) {
            if (this.scene.release !== undefined) this.scene.release()
            delete this.scene
        }
        const fade = new Fade(this.container, () => {
            this.container.removeChildren()
            this.scene = new {
                title: Title,
                villege: Villege,
                stageSelect: StageSelect,
                field: Field
            }[name](this.container)
        })
    }
}