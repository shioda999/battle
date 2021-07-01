import * as PIXI from 'pixi.js'
import { HEIGHT, GLOBAL, SKILL_JP, WIDTH, ITEM_NAME } from './global'
import { GraphicManager } from './GraphicManager'
import { Screen } from './Screen'
import { Status } from './Status'

const item_w = 30
const item_tab_num = 4
const item_tab_w = 300
const item_tab_h = 290
const equip_id = 1000
const mouse_over_time = 300
const tab_color = [0x5500bb, 0x00bb88, 0xccaa00, 0xaacc00]
const item_tab_grip_w = 22, item_tab_grip_h = 22
const item_tab_text_style = new PIXI.TextStyle({
    fontSize: item_tab_grip_h * 0.8,
    fontWeight: "bold",
    fill: 0xffffff,
    lineJoin: "round",
    strokeThickness: 3
})
export class Equipment {
    private static container
    private static equip
    private static box: PIXI.Graphics
    private static player_info_container: PIXI.Container
    private static current_player_id: number = 0
    private static eq_box: PIXI.Graphics[] = []
    private static item_tab: PIXI.Graphics[] = []
    private static item_boxes: PIXI.Graphics[] = []
    private static item_sprites = new Array(144).fill({})
    private static equip_sprites = new Array(4).fill({})
    private static graphic_inst = GraphicManager.GetInstance()
    private static able_to_set: boolean = true
    private static batu: PIXI.Graphics
    private static close_button: PIXI.Graphics
    private static left_arraw: PIXI.Graphics
    private static right_arraw: PIXI.Graphics
    private static mouse_over_sprite_id: number = 0
    private static item_info_box: PIXI.Graphics
    private static current_item_tab_id: number = 0
    private static player_info_text: PIXI.Text
    private static player_info_text2: PIXI.Text
    private static closing_callback: () => any
    public static init(container, closing_callback) {
        if (Equipment.container) return
        Equipment.container = container
        this.equip = new PIXI.Container()
        this.equip.zIndex = 5000
        this.equip.sortableChildren = true

        this.create_batu()
        this.create_box()
        this.create_item_tab()
        this.disp_player_info(0)
        this.closing_callback = closing_callback
    }
    public static hide() {
        this.container.removeChild(this.equip)
        if (this.closing_callback) this.closing_callback()
    }
    public static show(id: number) {
        this.container.addChild(this.equip)
        this.disp_player_info(id)
    }
    private static create_box() {
        const w = WIDTH * 0.9, h = HEIGHT * 0.7
        const box = new PIXI.Graphics()
        box.sortableChildren = true
        box.lineStyle(2, 0)
        box.beginFill(0x80c0f0)
        box.drawRect(0, 0, w, h)
        box.endFill()
        box.interactive = true
        box.position.set(WIDTH * 0.05, 20)
        box.sortableChildren = true
        this.equip.addChild(box)
        this.box = box
        const text_h = 15
        let style = Object.assign({}, item_tab_text_style)
        style.fontSize = text_h * 0.8
        for (let i = 0; i < 4; i++) {
            const p = new PIXI.Graphics()
            p.lineStyle(2, 0)
            p.drawRect(-item_w / 2, -item_w / 2, item_w, item_w)
            p.beginFill(tab_color[i])
            p.drawRect(-item_w / 2, -text_h - item_w / 2, item_w, text_h)
            p.endFill()
            p.position.set(50 + item_w * i * 1.2, 280)
            const text = new PIXI.Text((i + 1).toString(), style)
            p.addChild(text)
            p.zIndex = 0
            text.y = - item_w / 2
            text.anchor.set(0.5, 1)
            box.addChild(p)
            this.eq_box.push(p)
        }
        this.create_close_button()
        this.create_arrow()
    }
    private static create_close_button() {
        const b = new PIXI.Graphics()
        b.lineStyle(1, 0)
        b.beginFill(0xaaaaaa)
        b.drawCircle(0, 0, 15)
        b.endFill()
        const batu = this.batu.clone()
        batu.scale.set(0.6)
        b.addChild(batu)
        b.interactive = true
        b.on("pointerup", () => this.hide())
        b.on("mouseover", () => b.tint = 0xff3333)
        b.on("mouseout", () => b.tint = 0xffffff)
        b.position.set(WIDTH * 0.9, 0)
        this.box.addChild(b)
    }
    private static disp_player_info(id: number) {
        id = (id + GLOBAL.FORMATION.length) % GLOBAL.FORMATION.length
        this.current_player_id = id
        if (!this.player_info_container) {
            this.player_info_container = new PIXI.Container()
            this.box.addChild(this.player_info_container)
        }
        else this.player_info_container.removeChildren()
        const graph = GraphicManager.GetInstance()
        const sprite = graph.GetSprite("player", [0])
        sprite.position.set(80, 45)
        this.player_info_container.addChild(sprite)
        this.update_player_info_text(id)
        this.set_player_equipment(id)
    }
    private static update_player_info_text(id) {
        if (this.player_info_text) this.player_info_container.removeChild(this.player_info_text)
        if (this.player_info_text2) this.player_info_container.removeChild(this.player_info_text2)
        const style = new PIXI.TextStyle({
            fill: "white",
            fontSize: 18,
            lineJoin: "round",
            strokeThickness: 3,
            lineHeight: 40
        })
        const data = GLOBAL.FORMATION[id].data
        Status.update_attack(data)
        const str = "Lv:" + data.Lv + "\n技:" + SKILL_JP[data.attack] + "\nHP:" + data.hp + "\n速:" + data.speed
        const str2 = "\n\n攻:" + Status.get_atk(data) + "\n防:" + Status.get_def(data)
        const text = new PIXI.Text(str, style)
        const text2 = new PIXI.Text(str2, style)
        this.player_info_container.addChild(text)
        this.player_info_container.addChild(text2)
        this.player_info_text = text
        this.player_info_text2 = text2
        text.position.set(20, 85)
        text2.position.set(120, 85)
    }
    private static create_arrow() {
        const l = new PIXI.Graphics()
        const r = new PIXI.Graphics()
        const size = 15
        l.lineStyle(1, 0)
        l.beginFill(0xffee00)
        l.drawPolygon([0, -size, -size, 0, 0, size])
        l.endFill()
        l.tint = 0xdddddd
        l.interactive = true
        l.on("pointerdown", () => l.alpha = 0.5)
        l.on("pointerup", () => { this.disp_player_info(this.current_player_id - 1); l.alpha = 1 })
        l.on("mouseover", () => l.tint = 0xffffff)
        l.on("mouseout", () => { l.tint = 0xdddddd; l.alpha = 1 })
        l.position.set(40, 45)
        this.left_arraw = l
        r.lineStyle(1, 0)
        r.beginFill(0xffee00)
        r.drawPolygon([0, -size, size, 0, 0, size])
        r.endFill()
        r.tint = 0xdddddd
        r.interactive = true
        r.on("pointerdown", () => r.alpha = 0.5)
        r.on("pointerup", () => { this.disp_player_info(this.current_player_id + 1); r.alpha = 1 })
        r.on("mouseover", () => r.tint = 0xffffff)
        r.on("mouseout", () => { r.tint = 0xdddddd; r.alpha = 1 })
        r.position.set(120, 45)
        this.right_arraw = r
        this.box.addChild(l)
        this.box.addChild(r)
    }
    private static create_batu() {
        const batu = new PIXI.Graphics()
        const a = 5
        let path = [
            -16, a - 16, a - 16, -16, -1, -1 - a, 0, -1 - a, 15 - a, -16, 15, a - 16,
            a, -1, a, 0, 15, 15 - a, 15 - a, 15, 0, a, -1, a,
            a - 16, 15, -16, 15 - a, -1 - a, 0, -1 - a, -1
        ];
        batu.lineStyle(2, 0)
        batu.beginFill(0xFFFFFF, 1)
        batu.drawPolygon(path)
        batu.endFill()
        batu.zIndex = 6000
        batu.alpha = 0
        batu.tint = 0xff0000
        this.batu = batu
    }
    private static set_player_equipment(id: number) {
        const data = GLOBAL.FORMATION[id].data
        const graph = GraphicManager.GetInstance()
        this.equip_sprites.forEach(n => {
            if (n.texture) this.item_tab[this.current_item_tab_id].removeChild(n)
        })
        this.equip_sprites = new Array(4).fill({})
        data.equip.forEach((n, i) => {
            if (!n.name) return
            const sprite = this.get_item_sprite(n.name, i + equip_id)
            const x = this.eq_box[i].x - this.item_tab[0].x
            const y = this.eq_box[i].y - this.item_tab[0].y
            this.item_tab[this.current_item_tab_id].addChild(sprite)
            sprite.position.set(x, y)
            this.equip_sprites[i] = sprite
        })
    }
    private static create_item_tab() {
        const grip_w = item_tab_grip_w, grip_h = item_tab_grip_h
        const p = [item_tab_w, 0, item_tab_w, item_tab_h, 0, item_tab_h, 0, 0]
        for (let i = 0; i < item_tab_num; i++) {
            const tab = new PIXI.Graphics()
            const text = new PIXI.Text((i + 1).toString(), item_tab_text_style)
            text.position.set(grip_w * (i + 0.5), - grip_h)
            text.anchor.x = 0.5
            text.interactive = true
            let add_p
            if (i === 0) add_p = [grip_w * i, -grip_h, grip_w * (i + 1), -grip_h, grip_w * (i + 1), 0]
            else add_p = [grip_w * i, 0, grip_w * i, -grip_h, grip_w * (i + 1), -grip_h, grip_w * (i + 1), 0]
            tab.lineStyle(2, 0)
            tab.beginFill(tab_color[i])
            tab.drawPolygon(p.concat(add_p))
            tab.endFill()
            tab.zIndex = 4
            tab.interactive = true
            tab.sortableChildren = true
            tab.tint = 0xbbbbbb
            if (i === 0) tab.tint = 0xffffff, tab.zIndex = 5
            text.on("pointerup", () => {
                this.item_tab.forEach(n => { n.zIndex = 4, n.tint = 0xbbbbbb })
                this.equip_sprites.forEach(n => { if (n.texture) { n.parent.removeChild(n); tab.addChild(n) } })
                tab.zIndex = 5
                tab.tint = 0xffffff
                this.current_item_tab_id = i
            })
            text.on("mouseover", () => {
                tab.tint = 0xffffff
            })
            text.on("mouseout", () => {
                if (tab.zIndex !== 5) tab.tint = 0xbbbbbb
            })
            tab.position.set(260, 30)
            tab.addChild(text)
            this.item_tab.push(tab)
            this.box.addChild(tab)
        }
        this.create_item_boxes()
    }
    private static create_item_boxes() {
        const box = new PIXI.Graphics()
        box.lineStyle(2, 0)
        box.drawRect(-item_w / 2, -item_w / 2, item_w, item_w)
        box.endFill()
        for (let i = 0; i < item_tab_num; i++) {
            const dx = item_w * 1.4
            for (let y = dx; y < item_tab_h; y += dx) {
                for (let x = dx; x < item_tab_w - dx; x += dx) {
                    const b = box.clone()
                    this.item_tab[i].addChild(b)
                    b.position.set(x, y)
                    this.item_boxes.push(b)
                }
            }
        }
        this.set_item()
    }
    private static set_item() {
        const graph = GraphicManager.GetInstance()
        GLOBAL.ITEM.forEach((n, i) => {
            if (!n.name) return
            const sprite = this.get_item_sprite(n.name, i)
            this.item_tab[Math.floor(i / 36)].addChild(sprite)
            const x = this.item_boxes[i].x
            const y = this.item_boxes[i].y
            sprite.position.set(x, y)
            this.item_sprites[i] = sprite
        })
    }
    private static get_item_sprite(name: string, i: number) {
        const sprite = this.graphic_inst.GetSprite("tool", [ITEM_NAME.indexOf(name)])
        sprite.name = name
        this.add_event_to_sprite(sprite, i)
        return sprite
    }
    private static add_event_to_sprite(sprite: PIXI.Sprite, i: number) {
        sprite.interactive = true
        sprite.removeAllListeners()
        sprite.on("pointerdown", () => { this.spriteDragStart(sprite, i); this.close_item_info_box(sprite); })
        sprite.on('pointerup', () => { this.spriteDragEnd(sprite, i) })
        sprite.on('pointerupoutside', () => this.spriteDragEnd(sprite, i))
        sprite.on('pointermove', () => { this.spriteDragging(sprite, i) })
        sprite.on("mouseover", () => this.mouse_over_sprite(sprite, i))
        sprite.on("mouseout", () => this.close_item_info_box(sprite))
    }
    private static mouse_over_sprite(sprite, id) {
        this.mouse_over_sprite_id = id
        setTimeout(() => this.disp_item_info(sprite, id), mouse_over_time)
    }
    private static disp_item_info(sprite, id) {
        if (sprite.alpha === 0.5) return
        if (this.mouse_over_sprite_id === id) {
            this.create_item_info_box(sprite, id)
        }
    }
    private static create_item_info_box(sprite, id) {
        if (this.item_info_box) this.item_tab[this.current_item_tab_id].removeChild(this.item_info_box)
        const box = new PIXI.Graphics()
        let enchant
        if (this.is_equip(id)) enchant = GLOBAL.FORMATION[this.current_player_id].data.equip[id - equip_id].enchant
        else enchant = GLOBAL.ITEM[id].enchant
        let str = ""
        if (enchant) {
            enchant.forEach(n => {
                str += n + "\n"
            });
        }
        const style = new PIXI.TextStyle({
            fontSize: 18,
            fill: "white"
        })
        const name = new PIXI.Text(sprite.name, style)
        const style2 = new PIXI.TextStyle({
            fontSize: 13,
            fill: "white"
        })
        const info = new PIXI.Text(str, style2)
        name.x = info.x = 15
        info.y = name.height
        box.beginFill(0)
        box.drawRect(0, 0, 100, 50)
        box.endFill()
        box.addChild(name)
        box.addChild(info)
        box.zIndex = 1000
        box.position.set(sprite.x, sprite.y)
        this.item_tab[this.current_item_tab_id].addChild(box)
        this.item_info_box = box
    }
    private static close_item_info_box(sprite) {
        this.mouse_over_sprite_id = -1
        this.item_tab[this.current_item_tab_id].removeChild(this.item_info_box)
    }
    private static spriteDragStart(sprite: PIXI.Sprite, id: number) {
        sprite.alpha = 0.5
        sprite.zIndex = 1
    }
    private static spriteDragging(sprite: PIXI.Sprite, id: number) {
        if (sprite.alpha !== 0.5) return
        const mouse = Screen.init().app.renderer.plugins.interaction.mouse.global
        sprite.x = mouse.x - this.container.x - this.box.x - this.item_tab[0].x
        sprite.y = mouse.y - this.container.y - this.box.y - this.item_tab[0].y
        let id2 = this.arrange_pos(sprite)
        this.check_able_to_set(sprite, id, id2)
    }
    private static spriteDragEnd(sprite: PIXI.Sprite, id: number) {
        if (sprite.alpha !== 0.5) return
        sprite.alpha = 1
        sprite.zIndex = 0
        let id2 = this.arrange_pos(sprite)
        if (id2 !== -1 && this.able_to_set) {
            this.swap_sprite(sprite, id, id2)
        }
        else {
            this.set_sprite_by_id(sprite, id)
            this.batu.alpha = 0
        }
    }
    private static swap_sprite(sprite: PIXI.Sprite, id: number, id2: number) {
        let sprite2
        if (this.is_equip(id2)) sprite2 = this.equip_sprites[id2 - equip_id]
        else sprite2 = this.item_sprites[id2]
        if (!sprite2.texture) {
            this.set_sprite_by_id(sprite, id2)
            this.add_event_to_sprite(sprite, id2)
            if (this.is_equip(id2)) this.equip_sprites[id2 - equip_id] = sprite
            else this.item_sprites[id2] = sprite
            if (this.is_equip(id)) this.equip_sprites[id - equip_id] = sprite2
            else this.item_sprites[id] = sprite2
        }
        else {
            let temp = sprite.texture
            sprite.texture = sprite2.texture
            sprite2.texture = temp
            let temp_name = sprite.name
            sprite.name = sprite2.name
            sprite2.name = temp_name
            this.set_sprite_by_id(sprite, id)
        }
        this.swap_data(id, id2)
    }
    private static swap_data(id: number, id2: number) {
        let target1, target2
        if (this.is_equip(id)) {
            target1 = GLOBAL.FORMATION[this.current_player_id].data.equip[id - equip_id]
        }
        else {
            target1 = GLOBAL.ITEM[id]
        }
        if (this.is_equip(id2)) {
            target2 = GLOBAL.FORMATION[this.current_player_id].data.equip[id2 - equip_id]
        }
        else {
            target2 = GLOBAL.ITEM[id2]
        }
        if (target2.name) {
            let temp_name = target1.name
            target1.name = target2.name
            target2.name = temp_name
            let temp = target1.enchant
            target1.enchant = target2.enchant.slice()
            target2.enchant = temp.slice()
        }
        else {
            target2.name = target1.name
            target2.enchant = target1.enchant.slice()
            target1.name = undefined
            target1.enchant = undefined
        }
        this.update_player_info_text(this.current_player_id)
    }
    private static check_able_to_set(sprite, id: number, id2: number) {
        if (this.is_equip(id) === this.is_equip(id2)) {
            this.hide_batu()
            return
        }
        if (id2 === -1) this.able_to_set = true
        else {
            let v
            if (this.is_equip(id)) v = id - equip_id
            else v = id2 - equip_id
            this.able_to_set = v === this.current_item_tab_id
        }
        if (!this.able_to_set) this.show_batu(sprite.x, sprite.y)
        else if (this.batu.alpha === 0.8) this.hide_batu()
    }
    private static show_batu(x, y) {
        this.item_tab[this.current_item_tab_id].addChild(this.batu)
        this.batu.position.set(x, y)
        this.batu.alpha = 0.8
    }
    private static hide_batu() {
        this.batu.alpha = 0
        this.item_tab[this.current_item_tab_id].removeChild(this.batu)
    }
    private static set_sprite_by_id(sprite, id) {
        if (this.is_equip(id)) {
            sprite.x = this.eq_box[id - equip_id].x - this.item_tab[0].x
            sprite.y = this.eq_box[id - equip_id].y - this.item_tab[0].y
        }
        else {
            sprite.x = this.item_boxes[id].x
            sprite.y = this.item_boxes[id].y
        }
    }
    private static is_equip(id: number) {
        return id >= equip_id
    }
    private static arrange_pos(sprite) {
        const k = 0.3
        for (let i = 0; i < this.item_boxes.length; i++) {
            const dx = this.item_boxes[i].x - sprite.x
            const dy = this.item_boxes[i].y - sprite.y
            if (Math.abs(dx) <= item_w * k && Math.abs(dy) <= item_w * k) {
                sprite.x += dx
                sprite.y += dy
                return i + this.current_item_tab_id * 36
            }
        }
        for (let i = 0; i < this.eq_box.length; i++) {
            const dx = this.eq_box[i].x - sprite.x - this.item_tab[0].x
            const dy = this.eq_box[i].y - sprite.y - this.item_tab[0].y
            if (Math.abs(dx) <= item_w * k && Math.abs(dy) <= item_w * k) {
                sprite.x += dx
                sprite.y += dy
                return equip_id + i
            }
        }
        return -1
    }
}