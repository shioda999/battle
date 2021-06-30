export class Status {
    public static update_attack(data) {
        let attack: string = "tackle"
        for (let i = 0; i < data.equip.length; i++) {
            switch (data.equip[i].name) {
                case "sword":
                    attack = "slash"
                    break
                case "rod":
                    attack = "explosion"
                    break
            }
        }
        return data.attack = attack
    }
    public static get_atk(data): number {
        const lv = data.Lv
        const equip = data.equip
        let atk: number = lv + 9
        equip.forEach(n => {
            switch (n.name) {
                case "sword":
                    atk += 10
                    break
            }
            if (n.enchant) {
                n.enchant.forEach(n2 => {
                    switch (n2) {
                        case "atk+10":
                            atk += 10
                            break
                        case "atk+15":
                            atk += 15
                            break
                    }
                })
            }
        });
        return atk
    }
    public static get_def(data): number {
        const lv = data.Lv
        const equip = data.equip
        let def: number = lv + 9
        equip.forEach(n => {
            switch (n.name) {
                case "sword":
                    def += 10
                    break
            }
            if (n.enchant) {
                n.enchant.forEach(n2 => {
                    switch (n2) {
                        case "def+10":
                            def += 10
                            break
                        case "def+15":
                            def += 15
                            break
                    }
                })
            }
        });
        return def
    }
}