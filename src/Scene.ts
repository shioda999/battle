import { ItemManager } from "./ItemManager"
import { WIDTH, HEIGHT } from './global'
export type SceneType = "title" | "villege" | "stageSelect" | "field" | "back"
export class Scene {
    private static func: (v: SceneType) => any
    private static func2: () => any
    protected release = undefined
    constructor() { }
    public static SetGotoSceneFunction(func: (v: SceneType) => any, func2: () => any) {
        this.func = func
        this.func2 = func2
    }
    public gotoScene(name: SceneType) {
        Scene.func(name)
    }
    public exitCurrentScene() {
        Scene.func2()
    }
}