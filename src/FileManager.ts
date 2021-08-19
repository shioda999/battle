import { LOADED } from "./global"
export class FileManager {
    private static callback: () => any
    private static data = {}
    private static count: number = 0

    public static loadFiles(id: string[]) {
        id.forEach(n => this.loadFile(n))
    }
    private static loadFile(id: string) {
        const xhr = new XMLHttpRequest();
        this.count++
        xhr.open('GET', "asset/" + id + ".json", true);
        console.log(id + ".json is loading...")
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                this.data[id] = JSON.parse(xhr.responseText)
            }
            LOADED.add_loaded_count()
            this.count--
            if (this.count === 0) {
                if (this.callback) this.callback()
                this.callback = undefined
            }
        }
        setTimeout(() => xhr.send(null), 30)
    }
    public static SetLoadedFunc(callback: () => any) {
        this.callback = callback
        if (this.count === 0 && this.callback) {
            this.callback()
            this.callback = undefined
        }
    }
    public static getData(id: string) {
        const data = this.data[id]
        if (data == undefined) console.log("getData failed!!!   " + id)
        return data
    }
}