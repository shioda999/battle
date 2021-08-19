import sound from 'pixi-sound'
import { LOADED } from './global'
import { AppLoaderPlugin } from 'pixi.js'
export class Sound {
    private static sound_list = []
    private static id_to_sound = {}
    private static id_to_group = {}
    private static group_to_volume = { "bgm": 0.1, "se": 0.1 }
    public static loadSounds(SOUND_DATA) {
        for (let group in SOUND_DATA) {
            SOUND_DATA[group].forEach((id) => {
                this.load("sound\\" + id + ".mp3", id, group)
            })
        }
    }
    public static load(fileName: string, id: string, group: string) {
        if (this.id_to_sound[id]) {
            return
        }
        fileName = "asset/" + fileName
        const inst = sound.Sound.from({ url: fileName, preload: true, complete: () => LOADED.add_loaded_count() })
        this.sound_list.push(inst)
        this.id_to_sound[id] = inst
        this.id_to_group[id] = group
    }
    public static play(id: string, loop = false) {
        if (!this.id_to_sound[id]) {
            return
        }
        const inst: any = this.id_to_sound[id]
        inst.volume = this.group_to_volume[this.id_to_group[id]]
        if (loop) {
            inst.play().on('end', () => {
                Sound.play(id, loop)
            })
        }
        else inst.play()
    }
    public static pause(id: string) {
        if (id === "all") {
            this.sound_list.forEach(n => n.pause())
        }
        if (!this.id_to_sound[id]) {
            return
        }
        this.id_to_sound[id].pause()
    }
    public static restart(id: string) {
        if (id === "all") {
            this.sound_list.forEach(n => n.resume())
        }
        if (!this.id_to_sound[id]) {
            return
        }
        this.id_to_sound[id].resume()
    }
    public static stop(id: string) {
        if (id === "all") {
            this.sound_list.forEach(n => n.stop())
        }
        if (!this.id_to_sound[id]) {
            return
        }
        this.id_to_sound[id].stop()
    }
    public static set_volume(group: string, volume: number) {
        this.group_to_volume[group] = volume
    }
    public static set_master_volume(volume: number) {
        sound.volumeAll = volume
    }
}