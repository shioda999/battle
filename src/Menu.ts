import * as PIXI from 'pixi.js'
import { Equipment } from './Equipment'
import { HEIGHT, GLOBAL, WIDTH, SKILL_JP } from './global'
import { GraphicManager } from './GraphicManager'
import { Screen } from './Screen'
import { Status } from './Status'

const board_w = WIDTH * 0.8, board_h = HEIGHT * 0.75
const square_w = 320, square_h = 336
const p_box_w = 34, p_box_h = 50
const mouse_over_time = 300

export class Menu {
    public static show_flag: boolean = false
    private static container: PIXI.Container
    private static menu: PIXI.Container
    private static sprites: PIXI.Sprite[] = []
    private static clicking: boolean = false
    private static able_to_set: boolean = false
    private static boards: PIXI.Graphics[]
    private static square: PIXI.Graphics
    private static batu: PIXI.Graphics
    private static close_button: PIXI.Graphics
    private static player_boxes: PIXI.Graphics[] = []
    private static base_box: PIXI.Graphics
    private static graphic_inst: GraphicManager
    private static mouse_over_sprite_id: number = 0
    private static player_info_box: PIXI.Graphics
    private static unset_player_boxes = []
    public static hide() {
        this.show_flag = false
        Equipment.hide()
        this.container.removeChild(this.menu)
    }
    public static show() {
        this.show_flag = true
        this.container.addChild(this.menu)
    }
    public static init(container) {
        if (Menu.container) return
        this.graphic_inst = GraphicManager.GetInstance()

        Menu.container = container
        this.menu = new PIXI.Container()
        this.menu.zIndex = 5000
        this.menu.sortableChildren = true

        this.base_box = new PIXI.Graphics()
        this.base_box.lineStyle(2, 0)
        this.base_box.beginFill(0xeeeeee)
        this.base_box.drawRect(0, 0, p_box_w, p_box_h)
        this.base_box.endFill()

        const graph = GraphicManager.GetInstance()
        this.boards = this.create_tab()
        const square = this.create_config_square()
        this.square = square
        this.batu = this.create_batu()
        this.create_close_button()

        this.create_player_box()

        this.boards.forEach(n => this.menu.addChild(n))
        this.boards[1].addChild(square)
        square.sortableChildren = true
        square.addChild(this.batu)
        GLOBAL.FORMATION.forEach((n, i) => {
            if (n.set) {
                const sprite = this.get_player_sprite(n.name, i)
                sprite.interactive = true
                sprite.position.set(n.x * 32 + 16, n.y * 32 + 16)
                sprite.on("pointerdown", () => this.spriteDragStart(sprite, i))
                sprite.on('pointerup', () => { this.clicking = false; this.spriteDragEnd(sprite, i) })
                sprite.on('pointerupoutside', () => this.spriteDragEnd(sprite, i))
                sprite.on('pointermove', () => { this.spriteDragging(sprite, i) });
                sprite.zIndex = 5002 + n.y
                this.sprites.push(sprite)
                square.addChild(sprite)
            }
            else {
                this.add_unset_player(this.get_player_sprite(n.name, i), i)
            }
        });
        Equipment.init(this.container, () => this.update_all_player_info_text())
    }
    private static add_unset_player(sprite, id) {
        const b = this.base_box.clone()
        let pos = this.get_new_boxPos()
        this.square.addChild(b)
        b.position.set(pos.x, pos.y)
        this.square.addChild(sprite)
        sprite.position.set(b.x + p_box_w / 2, b.y + p_box_h / 2)
        this.unset_player_boxes.push({ box: b, sprite: sprite })
    }
    private static get_player_sprite(name: string, i: number) {
        const sprite = this.graphic_inst.GetSprite(name, [8])
        sprite.name = name
        this.add_event_to_sprite(sprite, i)
        return sprite
    }
    private static add_event_to_sprite(sprite: PIXI.Sprite, i: number) {
        sprite.interactive = true
        sprite.removeAllListeners()
        sprite.on("pointerdown", () => { this.spriteDragStart(sprite, i); this.close_player_info_box(sprite); })
        sprite.on('pointerup', () => { this.spriteDragEnd(sprite, i) })
        sprite.on('pointerupoutside', () => this.spriteDragEnd(sprite, i))
        sprite.on('pointermove', () => { this.spriteDragging(sprite, i) })
        sprite.on("mouseover", () => this.mouse_over_sprite(sprite, i))
        sprite.on("mouseout", () => this.close_player_info_box(sprite))
    }
    private static mouse_over_sprite(sprite, id) {
        this.mouse_over_sprite_id = id
        setTimeout(() => this.disp_player_info(sprite, id), mouse_over_time)
    }
    private static disp_player_info(sprite, id) {
        if (sprite.alpha === 0.5) return
        if (this.mouse_over_sprite_id === id) {
            this.create_player_info_box(sprite, id)
        }
    }
    private static create_player_info_box(sprite, id) {
        if (this.player_info_box) this.square.removeChild(this.player_info_box)
        const box = new PIXI.Graphics()
        let data = GLOBAL.FORMATION[id].data
        let str = "Lv:" + data.Lv + " 速:" + data.speed + " HP:" + data.hp + "\n技:" + SKILL_JP[data.attack]
            + "\n攻:" + Status.get_atk(data) + " 防:" + Status.get_def(data)
        const style = new PIXI.TextStyle({
            fontSize: 15,
            fill: "white"
        })
        const name = new PIXI.Text(sprite.name, style)
        const style2 = new PIXI.TextStyle({
            fontSize: 10,
            fill: "white"
        })
        const info = new PIXI.Text(str, style2)
        name.x = info.x = 15
        info.y = name.height
        box.beginFill(0)
        box.drawRect(0, 0, 120, 60)
        box.endFill()
        box.addChild(name)
        box.addChild(info)
        box.zIndex = 10000
        box.position.set(sprite.x, sprite.y)
        this.square.addChild(box)
        this.player_info_box = box
    }
    private static close_player_info_box(sprite) {
        this.mouse_over_sprite_id = -1
        this.square.removeChild(this.player_info_box)
    }
    private static create_tab() {
        const p = [board_w, 0, board_w, board_h, 0, board_h, 0, 0]
        const tab_h = 30
        const tab_w = 100
        const tab = [
            {
                name: "装備",
                color: 0x5500bb,
            }, {
                name: "陣形",
                color: 0x00bb88
            }, {
                name: "データ",
                color: 0xccaa00
            }]
        let boards = []
        const style = new PIXI.TextStyle({
            fontSize: tab_h * 0.8,
            fontWeight: "bold",
            fill: 0xffffff,
            lineJoin: "round",
            strokeThickness: 3
        })
        tab.forEach((n, i) => {
            const board = new PIXI.Graphics()
            const text = new PIXI.Text(n.name, style)
            text.position.set(tab_w * (i + 0.5), - tab_h)
            text.anchor.x = 0.5
            let add_p
            if (i === 0) add_p = [tab_w * i, -tab_h, tab_w * (i + 1), -tab_h, tab_w * (i + 1), 0]
            else add_p = [tab_w * i, 0, tab_w * i, -tab_h, tab_w * (i + 1), -tab_h, tab_w * (i + 1), 0]
            board.lineStyle(2, 0)
            board.beginFill(n.color, 1)
            board.drawPolygon(p.concat(add_p))
            board.endFill()
            board.position.set(WIDTH / 64, tab_h + 5)
            board.zIndex = -i
            board.interactive = true
            board.tint = 0xbbbbbb
            if (i === 0) board.tint = 0xffffff, board.zIndex = 0
            board.on("pointerup", () => {
                boards.forEach(n => { n.zIndex = -1, n.tint = 0xbbbbbb })
                board.zIndex = 0
                board.tint = 0xffffff
            })
            board.on("mouseover", () => {
                board.tint = 0xffffff
            })
            board.on("mouseout", () => {
                if (board.zIndex) board.tint = 0xbbbbbb
            })
            board.addChild(text)
            boards.push(board)
        })
        return boards
    }
    private static create_player_box() {
        const graph = GraphicManager.GetInstance()
        GLOBAL.FORMATION.forEach((n, i) => {
            const p = new PIXI.Graphics()
            const w = 140, h = 45
            const sprite = graph.GetSprite("face", [0])
            p.lineStyle(2, 0)
            p.beginFill(0x80c0f0)
            p.drawRect(0, 0, w, h)
            p.endFill()
            p.position.set((i % 3) * (w + 20) + 25, Math.floor(i / 3) * (h + 10) + 20)
            p.interactive = true
            p.tint = 0xdddddd
            p.on("pointerup", () => this.click_playerbox(i))
            p.on("mouseover", () => p.tint = 0xffffff)
            p.on("mouseout", () => p.tint = 0xdddddd)
            p.addChild(sprite)
            this.player_boxes.push(p)
            sprite.position.set(h / 2, h / 2)
            sprite.anchor.set(0.5)
            sprite.scale.set(30 / sprite.width)
            p.zIndex = 1
            this.update_player_info_text(i)
            this.boards[0].addChild(p)
        })
    }
    private static update_all_player_info_text() {
        GLOBAL.FORMATION.forEach((n, i) => this.update_player_info_text(i))
    }
    private static update_player_info_text(id) {
        let prev_text = this.player_boxes[id].getChildByName("text")
        if (prev_text) this.player_boxes[id].removeChild(prev_text)
        const style = new PIXI.TextStyle({
            fontSize: 12,
            fill: "white"
        })
        const n = GLOBAL.FORMATION[id]
        const w = 140, h = 45
        const text = new PIXI.Text("Lv:" + n.data.Lv + "\n技:" + SKILL_JP[n.data.attack], style)
        text.name = "text"
        this.player_boxes[id].addChild(text)
        text.x = h + 5
        text.y = h / 2
        text.anchor.y = 0.5
    }
    private static click_playerbox(id: number) {
        Equipment.show(id)
    }
    private static create_config_square() {
        const square = new PIXI.Graphics()
        square.beginFill(0xaaaaaa, 1)
        square.lineStyle(2, 0, 1)
        square.drawRect(0, 0, square_w, square_h)
        square.position.set(WIDTH / 64, (board_h - square_h) / 2)
        square.endFill()
        square.zIndex = 5001
        square.sortableChildren = true
        return square
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
        return batu
    }
    private static spriteDragStart(sprite: PIXI.Sprite, id: number) {
        sprite.alpha = 0.5
    }
    private static spriteDragging(sprite: PIXI.Sprite, id: number) {
        if (sprite.alpha !== 0.5) return
        let set = this.arrangePos(sprite, id)
        sprite.zIndex = 5002 + Math.floor((sprite.y - 16) / 32)
        this.check_able_to_set(sprite, id, set)
    }
    private static check_able_to_set(sprite, id, set) {
        const x = Math.floor((sprite.x - 16) / 32), y = Math.floor((sprite.y - 16) / 32)
        this.able_to_set = true
        if (!set) return
        GLOBAL.FORMATION.forEach((n, i) => {
            if (i !== id) {
                if (n.x === x && n.y == y) this.able_to_set = false
            }
        })
        if (this.able_to_set) {
            this.batu.alpha = 0
        }
        else {
            this.batu.alpha = 0.8
            this.batu.position.set(sprite.x, sprite.y)
        }
    }
    private static spriteDragEnd(sprite: PIXI.Sprite, id: number) {
        if (sprite.alpha !== 0.5) return
        sprite.alpha = 1
        let set = this.arrangePos(sprite, id)
        if (GLOBAL.FORMATION[id].set === false && set) {
            this.remove_unset_player_box(sprite)
        }
        if (GLOBAL.FORMATION[id].set === true && !set) {
            this.add_unset_player(sprite, id)
        }
        GLOBAL.FORMATION[id].set = set
        if (this.able_to_set) {
            GLOBAL.FORMATION[id].x = Math.floor((sprite.x - 16) / 32)
            GLOBAL.FORMATION[id].y = Math.floor((sprite.y - 16) / 32)
        }
        else {
            sprite.position.set(GLOBAL.FORMATION[id].x * 32 + 16, GLOBAL.FORMATION[id].y * 32 + 16)
            this.batu.alpha = 0
        }
    }
    private static remove_unset_player_box(sprite) {
        let box = this.get_box_by_sprite(sprite)
        box.parent.removeChild(box)
        this.unset_player_boxes = this.unset_player_boxes.filter(n => n.sprite !== sprite)
        this.unset_player_boxes.forEach((n, i) => {
            n.box.x = i % 4 * p_box_w * 1.2 + WIDTH / 64 + square_w
            n.box.y = Math.floor(i / 4) * p_box_h * 1.2
            n.sprite.x = n.box.x + p_box_w / 2
            n.sprite.y = n.box.y + p_box_h / 2
        })
    }
    private static create_close_button() {
        const b = new PIXI.Graphics()
        b.lineStyle(1, 0)
        b.beginFill(0xaaaaaa)
        b.drawCircle(0, 0, 15)
        b.endFill()
        const batu = this.batu.clone()
        batu.scale.set(0.6)
        batu.tint = 0xffffff
        b.addChild(batu)
        b.interactive = true
        b.on("pointerup", () => this.hide())
        b.on("mouseover", () => b.tint = 0xff3333)
        b.on("mouseout", () => b.tint = 0xffffff)
        b.position.set(board_w + 10, 35)
        b.zIndex = 10000
        this.menu.addChild(b)
    }
    private static arrangePos(sprite, id) {
        const mouse = Screen.init().app.renderer.plugins.interaction.mouse.global
        let set: boolean = GLOBAL.FORMATION[id].set
        let x = mouse.x - this.container.x, y = mouse.y - this.container.y - 32
        y = Math.min(Math.max(Math.floor((y - 16) / 32), 0), 9) * 32 + 16
        if (x >= 336) {
            if (!set) {
                let box = this.get_box_by_sprite(sprite)
                x = box.x + p_box_w / 2, y = box.y + p_box_h / 2
            }
            else {
                let pos = this.get_new_boxPos()
                x = pos.x + p_box_w / 2, y = pos.y + p_box_h / 2
                set = false
            }
        }
        else {
            x = Math.min(Math.max(Math.floor((x - 16) / 32), 0), 9) * 32 + 16
            set = true
        }
        sprite.position.set(x, y)
        return set
    }
    private static get_new_boxPos() {
        let x = this.unset_player_boxes.length % 4 * p_box_w * 1.2
        let y = Math.floor(this.unset_player_boxes.length / 4) * p_box_h * 1.2
        return { x: x + WIDTH / 64 + square_w, y: y }
    }
    private static get_box_by_sprite(sprite) {
        for (let i = 0; i < this.unset_player_boxes.length; i++) {
            if (this.unset_player_boxes[i].sprite === sprite)
                return this.unset_player_boxes[i].box
        }
    }
    public static update() {
    }
}