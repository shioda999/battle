import { GraphicManager } from './GraphicManager'
import { Screen } from './Screen'
import { Key } from './key'
import { MapTip } from './Map'
import { Talk } from './Talk'
import { Effect } from './Effect'
import { HEIGHT, WIDTH } from './global'
import { DamageText } from './DamageText'
const DY = [1, 0, 0, -1]
const DX = [0, -1, 1, 0]
const KNOCKBACK_TIME = 10
export class Obj {
    public static go_out_flag: boolean = false
    private static screen: Screen
    private static key: Key
    private static map: MapTip
    private static graph: GraphicManager
    private static chara_list: Obj[] = []
    private static damage_data = []
    private sprite: PIXI.AnimatedSprite
    private attacking_count: number = 0
    private knockback_flag: boolean = true
    private knocking_count: number = 0
    private knocking_dx: number = 0
    private knocking_dy: number = 0
    private dying_count: number = 0
    private confuse_cnt: number = 0
    private frame: number = 0
    private count: number = 0
    private turn: number = 0
    private vx: number = 0
    private vy: number = 0
    private p: number = 1
    private w = 24
    private h = 26
    private hp: number
    private frame_freq: number = 12
    private confusing_sprite: PIXI.AnimatedSprite
    private static able_to_out: boolean = false
    private constructor(private container, private name: string, private enemy_flag: boolean,
        private state: string, private x: number, private y: number,
        private data: any) {
        if (!Obj.key) Obj.key = Key.GetInstance()
        if (!Obj.screen) Obj.screen = Screen.init()
        if (!Obj.graph) Obj.graph = GraphicManager.GetInstance()
        this.sprite = Obj.graph.GetSprite(this.name)
        this.sprite.gotoAndStop(0)
        this.container.addChild(this.sprite)
        this.sprite.position.set(this.x, this.y)
        this.sprite.zIndex = 2 + this.y
        this.hp = data.hp
        if (data.no_knockback) this.knockback_flag = false
        if (data.frame_freq) this.frame_freq = data.frame_freq
        if (enemy_flag) this.p = 2
    }
    public static set_current_map(map: MapTip, able_to_out = false) {
        Obj.map = map
        Obj.able_to_out = able_to_out
    }
    public static create_obj(container, name: string, enemy_flag: boolean, state: string,
        x: number, y: number, data: any) {
        Obj.chara_list.push(new Obj(container, name, enemy_flag, state, x, y, data))
    }
    public static update() {
        Obj.chara_list.forEach(n => n.update())
        Obj.chara_list.forEach(n => n.update2())
        Obj.deal_damage()
        Effect.update()
        DamageText.update()
        this.map.fog_sprite()
    }
    public static end() {
        let f = 0, e = 0
        Obj.chara_list.forEach(n => {
            if (n.enemy_flag) e++
            else f++
        })
        if (f && e) return ""
        if (f === 0) return "lose"
        else return "win"
    }
    public update() {
        switch (this.state) {
            case "normal":
                if (this.name === "player") this.player_move()
                break
            case "fight":
                this.fighting_move()
                break
        }
        this.sprite.zIndex = 2 + this.y
    }
    public update2() {
        if (this.dying_count) return
        else if (this.knocking_count) {
            this.knocking_count--
            this.knockbacking()
        }
        else this.move(this.vx, this.vy)
        this.vx = this.vy = 0
    }
    private confuse() {
        this.confuse_cnt = 200
        this.confusing_sprite = GraphicManager.GetInstance().GetSprite("hatena")
        this.confusing_sprite.zIndex = 10000
        this.confusing_sprite.anchor.y = 1.5
        this.confusing_sprite.animationSpeed = 0.1
        this.confusing_sprite.play()
        this.sprite.addChild(this.confusing_sprite)
    }
    private fighting_move() {
        let dam = { damage: 0, knockback: [0, 0], confusion: false, poison: false }
        if (this.dying_count) {
            this.dying_count++
            this.sprite.alpha = 1 - this.dying_count / 30
            if (this.sprite.alpha <= 0) Obj.remove(this)
            return
        }
        Effect.check_collision(this.x, this.y, this.enemy_flag, dam)
        if (dam.damage || dam.knockback[0]) {
            Obj.set_damage(this, dam.damage, dam.knockback[0], dam.knockback[1])
        }
        if (this.confuse_cnt > 0) {
            this.confuse_cnt--
            if (this.confuse_cnt == 0) {
                this.sprite.removeChild(this.confusing_sprite)
            }
        }
        if (dam.confusion) {
            this.confuse()
        }
        if (this.confuse_cnt > 150) return
        if (this.knocking_count) return
        if (this.attacking_count) {
            this.attaking_move()
            this.attacking_count--
            return
        }
        let target = this.search_target()
        if (!target) return
        let dx = target.x - this.x, dy = target.y - this.y
        let d = Math.sqrt(dx * dx + dy * dy)
        let ope = "rush"
        if (this.able_to_attack(dx, dy)) {
            this.attack(target, dx, dy)
            return
        }
        switch (ope) {
            case "rush":
                this.vx = dx / d * this.data.speed
                this.vy = dy / d * this.data.speed
                break
        }
    }
    private able_to_attack(dx: number, dy: number) {
        let angle = Math.atan2(dy, dx)
        switch (this.data.attack) {
            case "slash":
                return (dx * dx + dy * dy <= 50 * 50)
            case "tackle":
            case "strong_tackle":
                return (dx * dx + dy * dy <= 50 * 50)
            case "punch":
                return (dx * dx + dy * dy <= 45 * 45)
            case "explosion":
            case "fire":
            case "thunder":
            case "ice":
                return (dx * dx + dy * dy <= 128 * 128)
            case "tornado":
            case "confusion":
                return (dx * dx + dy * dy <= 192 * 192)
            case "bullet":
                return Math.abs(dy) <= 32
        }
    }
    private attack(target: Obj, dx: number, dy: number) {
        this.take_turn(dx, dy)
        let enemy_flag = !target.enemy_flag
        switch (this.data.attack) {
            case "slash":
                Effect.create_effect("slash", this.x + dx, this.y + dy, enemy_flag)
                this.attacking_count = 15
                Obj.set_damage(target, 50, DX[this.turn], DY[this.turn])
                return
            case "tackle":
                Effect.create_effect("hit", this.x + dx, this.y + dy, enemy_flag)
                this.attacking_count = 60
                Obj.set_damage(target, 10, DX[this.turn], DY[this.turn])
                return
            case "strong_tackle":
                Effect.create_effect("hit", this.x + dx - 2, this.y + dy - 2, enemy_flag)
                Effect.create_effect("hit", this.x + dx + 2, this.y + dy + 2, enemy_flag)
                this.attacking_count = 60
                Obj.set_damage(target, 40, DX[this.turn], DY[this.turn])
                return
            case "punch":
                Effect.create_effect("hit", this.x + dx, this.y + dy, enemy_flag)
                this.attacking_count = 8
                Obj.set_damage(target, 3, DX[this.turn] / 2, DY[this.turn] / 2)
                return
            case "explosion":
            case "fire":
            case "ice":
                Effect.create_effect(this.data.attack, this.x + dx, this.y + dy, enemy_flag)
                this.attacking_count = 80
                return
            case "thunder":
                Effect.create_effect(this.data.attack, this.x + dx, this.y + dy, enemy_flag)
                this.attacking_count = 120
                return
            case "confusion":
                Effect.create_effect(this.data.attack, this.x + dx, this.y + dy, enemy_flag)
                this.attacking_count = 300
                return
            case "tornado":
                Effect.create_effect(this.data.attack, this.x, this.y, enemy_flag, Math.atan2(dy, dx))
                this.attacking_count = 120
                return
            case "bullet":
                Effect.create_effect(this.data.attack, this.x, this.y, enemy_flag, Math.atan2(dy, dx) + (Math.random() - 0.5) * Math.PI / 30)
                this.attacking_count = 5
                return

        }
    }
    private attaking_move() {
        switch (this.data.attack) {
            case "tackle":
            case "strong_tackle":
                if (this.attacking_count > 55) {
                    this.sprite.x += DX[this.turn] * 5
                    this.sprite.y += DY[this.turn] * 5
                }
                else if (this.attacking_count < 45 && this.attacking_count >= 20) {
                    this.sprite.x -= DX[this.turn] * 1
                    this.sprite.y -= DY[this.turn] * 1
                }
                return
        }
    }
    private static set_damage(target: Obj, v: number, knockdx: number, knockdy: number) {
        this.damage_data.push([target, v, knockdx, knockdy])
    }
    private static deal_damage() {
        this.damage_data.forEach(n => {
            n[0].damage(n[1], n[2], n[3])
        })
        this.damage_data.length = 0
    }
    private damage(v: number, knockdx: number, knockdy: number) {
        if (this.knocking_count) return
        this.hp -= v
        if (v) DamageText.create_text(v, this.x, this.y - 30)
        if (this.hp <= 0) this.death()
        else {
            this.knockback(knockdx, knockdy)
        }
    }
    private death() {
        this.dying_count++
        this.sprite.tint = 0xFF0000
        const a = -this.w / 2, b = -this.h / 4
        Obj.map.clear_p(this.x + a, this.y + b, this.w, this.h)
    }
    private static remove(obj: Obj) {
        obj.container.removeChild(obj.sprite)
        this.chara_list = this.chara_list.filter(n => n !== obj)
    }
    private search_target() {
        let d: number = 1000
        let target
        Obj.chara_list.forEach(n => {
            if ((this.confuse_cnt || n.enemy_flag !== this.enemy_flag) && n.dying_count === 0 && n != this) {
                const dx = n.x - this.x, dy = n.y - this.y
                if (d > Math.sqrt(dx * dx + dy * dy)) {
                    target = n
                    d = Math.sqrt(dx * dx + dy * dy)
                }
            }
        })
        return target
    }
    private player_move() {
        let dx: number = 0, dy: number = 0
        const speed = 2.5
        if (Talk.talking) return
        if (Obj.key.IsPress_Now("left")) {
            dx = -1
        }
        if (Obj.key.IsPress_Now("right")) {
            dx = 1
        }
        if (Obj.key.IsPress_Now("up")) {
            dy = -1
        }
        if (Obj.key.IsPress_Now("down")) {
            dy = 1
        }
        if (Obj.screen.clicking) {
            let len = Obj.chara_list.length
            const px = this.x + DX[this.turn] * 32
            const py = this.y + DY[this.turn] * 32
            for (let i = 0; i < len; i++) {
                const ox = Obj.chara_list[i].x
                const oy = Obj.chara_list[i].y
                if (Math.abs(px - ox) <= this.w && Math.abs(py - oy) <= 32) {
                    if (Obj.chara_list[i] != this) {
                        this.talk(Obj.chara_list[i])
                    }
                }
            }
        }
        if (dx != 0 || dy != 0) {
            const r = Math.sqrt(dx * dx + dy * dy)
            dx /= r, dy /= r;
        }
        this.vx = dx * speed
        this.vy = dy * speed
    }
    private talk(obj: Obj) {
        obj.take_turn(-DX[this.turn], -DY[this.turn])
        Talk.talk(obj.data.name)
    }
    public take_turn(dx: number, dy: number) {
        if (dy > 0) this.turn = 0
        if (dy < 0) this.turn = 3
        if (dx < 0) this.turn = 1
        if (dx > 0) this.turn = 2
        this.count = 0
        this.frame = this.turn * 4 + this.count / this.frame_freq;
        this.sprite.gotoAndStop(this.frame)
    }
    private Org(v: number, keta) {
        return Math.round(v * Math.pow(10, keta)) / Math.pow(10, keta)
    }
    public move(dx: number, dy: number) {
        const a = -this.w / 2, b = -this.h / 4
        dx = this.Org(dx, 3)
        dy = this.Org(dy, 3)
        const r = Math.sqrt(dx * dx + dy * dy)
        if (dx == 0 && dy == 0) {
            this.count = 0
            this.frame = this.turn * 4 + this.count / this.frame_freq;
            this.sprite.gotoAndStop(this.frame)
            Obj.map.set_p(this.x + a, this.y + b, this.w, this.h, this.p)
            return
        }
        Obj.map.clear_p(this.x + a, this.y + b, this.w, this.h)
        if (this.knocking_count == 0) {
            if (dy > 0) this.turn = 0
            if (dy < 0) this.turn = 3
            if (dx < 0) this.turn = 1
            if (dx > 0) this.turn = 2
        }

        if (!Obj.map.check_p(this.x + a + dx, this.y + b + dy, this.w, this.h, this.p)) {
            if (!Obj.map.check_p(this.x + a + dx, this.y + b, this.w, this.h, this.p)) {
                dx = 0
                if (!Obj.map.check_p(this.x + a, this.y + b + dy, this.w, this.h, this.p)) {
                    dy = 0
                }
            }
            else dy = 0
        }
        const r2 = Math.sqrt(dx * dx + dy * dy)
        if (r2) {
            if (Obj.map.check_p(this.x + a + dx / r2 * r, this.y + b + dy / r2 * r, this.w, this.h, this.p)) {
                dx = dx / r2 * r
                dy = dy / r2 * r
            }
        }
        this.x += dx
        this.y += dy
        if (dx != 0 || dy != 0) {
            if (this.knocking_count == 0) {
                if (dy > 0) this.turn = 0
                if (dy < 0) this.turn = 3
                if (dx < 0) this.turn = 1
                if (dx > 0) this.turn = 2
            }
            this.count++
            this.count %= this.frame_freq * 4
            this.update_pos()
        }
        else this.count = 0
        this.frame = this.turn * 4 + this.count / this.frame_freq;
        this.sprite.gotoAndStop(this.frame)
        Obj.map.set_p(this.x + a, this.y + b, this.w, this.h, this.p)
    }
    private knockback(dx: number, dy: number) {
        if (!this.knockback_flag) return
        const a = -this.w / 2, b = -this.h / 4
        Obj.map.clear_p(this.x + a, this.y + b, this.w, this.h)
        this.x = this.sprite.x, this.y = this.sprite.y
        this.knocking_count = KNOCKBACK_TIME
        this.knocking_dx = dx
        this.knocking_dy = dy
    }
    private knockbacking() {
        this.x += this.knocking_dx * 2 + this.knocking_count / KNOCKBACK_TIME
        this.y += this.knocking_dy * 2 - (this.knocking_count - KNOCKBACK_TIME / 2 + 0.5) / 10
        this.update_pos()
    }
    private update_pos() {
        this.sprite.position.set(this.x, this.y)
        if (Obj.able_to_out) {
            if (this.x < 0 || this.x > WIDTH || this.y < 0 || this.y > HEIGHT) Obj.go_out_flag = true
        }
        else {
            this.x = Math.max(this.w / 2, Math.min(WIDTH - this.w / 2, this.x))
            this.y = Math.max(this.h / 2, Math.min(HEIGHT - this.h / 2 - 32, this.y))
        }
    }
    public static destroy() {
        Obj.go_out_flag = false
        this.chara_list.length = 0
        this.map.clear_all_p()
    }
    public static removeSprites() {
        this.chara_list.forEach(n => n.container.removeChild(n.sprite))
    }
}