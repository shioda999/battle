import sound from 'pixi-sound'
export class Sound {
    private static sound_list = []
    private static id_to_sound = {}
    private static id_to_group = {}
    private static group_to_volume = { "bgm": 0.1, "se": 0.1 }
    public static load(fileName: string, id: string, group: string) {
        if (this.id_to_sound[id]) {
            return
        }
        fileName = "asset/" + fileName
        const inst = sound.Sound.from({ url: fileName, preload: true })
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
        if (!this.id_to_sound[id]) {
            return
        }
        this.id_to_sound[id].pause()
    }
    public static stop(id: string) {
        if (id === "all") {
            this.sound_list.forEach(n => n.pause())
        }
        if (!this.id_to_sound[id]) {
            return
        }
        this.id_to_sound[id].pause()
    }
    public static set_volume(group: string, volume: number) {
        this.group_to_volume[group] = volume
    }
    public static set_master_volume(volume: number) {
        sound.volumeAll = volume
    }
}