export const WIDTH = 640
export const HEIGHT = 480
export const SOUND_DATA = {
    "bgm": [
        "villege", "stageselect", "dangeon", "dangeon2", "dangeon3", "dangeon4", "dangeon5", "dangeon6"
    ],
    "se": [
        "decide", "back"
    ]
}
export const GRAPH_FNAME = [
    "player", "merchant", "map", "K", "face", "tool"
]
export const GRAPH_FNAME2 = [
    "zombie", "slime", "docro", "fairy", "lamia", "succubus", "witch", "golem", "fireman"
]
export const EFFECT_FNAME = [
    "slash", "hit", "explosion", "fire", "tornado", "thunder", "ice", "bullet", "confusion", "hatena"
]
export const SKILL_JP = {
    "slash": "スラッシュ",
    "tackle": "タックル",
    "punch": "パンチ",
    "explosion": "エクスプロージョン",
    "fire": "ファイヤー",
    "tornado": "トルネード",
    "ice": "アイス",
    "bullet": "銃撃"
}
export const JSON_FNAME = ["map/villege", "map/field", "map/points", "talk/talk"]
export const SPEED = 4
export const POS_X = WIDTH / 4
export const G = 1
export const ENEMY_STATUS = {
    slime: {
        speed: 1, Lv: 1, attack: "tackle", hp: 100,
    },
    zombie: {
        speed: 1, Lv: 1, attack: "tackle", hp: 1000,
    },
    fairy: {
        speed: 2, Lv: 1, attack: "tornado", hp: 800,
    },
    docro: {
        speed: 0.3, Lv: 1, attack: "tackle", hp: 500, frame_freq: 24
    },
    lamia: {
        speed: 0.8, Lv: 1, attack: "strong_tackle", hp: 1200
    },
    witch: {
        speed: 0.5, Lv: 1, attack: "thunder", hp: 1000
    },
    golem: {
        speed: 0.1, Lv: 1, attack: "tackle", hp: 8000, frame_freq: 30, no_knockback: true
    },
    succubus: {
        speed: 1.5, Lv: 1, attack: "confusion", hp: 1500, frame_freq: 18
    },
    fireman: {
        speed: 3, Lv: 1, attack: "fire", hp: 1500, frame_freq: 18
    }
}
export const ITEM_NAME = [
    "sword", "sheild", "rod"
]
export namespace GLOBAL {
    export let pause_flag: boolean
    export let FORMATION
    export let ITEM
    export let money = 300
    export let ITEM_NUM = 36
    export function add_item(item_data) {
        for (let i = 0; i < ITEM_NUM; i++) {
            if (!ITEM[i].name) {
                ITEM[i] = item_data
                return
            }
        }
    }
}
namespace SAVEDATA {
    export let FORMATION = [
        {
            name: "player",
            set: true,
            x: 9,
            y: 4,
            data: {
                speed: 2, Lv: 1, attack: "slash", hp: 400,
                equip: [
                    {
                        name: "sword",
                        enchant: ["atk+15"]
                    }
                ]
            }
        },
        {
            name: "player",
            set: true,
            x: 9,
            y: 5,
            data: {
                speed: 2, Lv: 1, attack: "slash", hp: 500,
                equip: [
                    {
                        name: "sword",
                        enchant: []
                    }
                ]
            },
        },
        {
            name: "player",
            set: true,
            x: 9,
            y: 6,
            data: {
                speed: 2, Lv: 3, attack: "slash", hp: 700,
                equip: [
                    {
                        name: "sword",
                        enchant: []
                    }
                ]
            }
        }
    ]
    export let ITEM = [
        {
            name: "sword",
            enchant: ["atk+10"]
        },
        {
            name: "rod",
            enchant: []
        },
        {
            name: "sword",
            enchant: []
        },
        {
            name: "sword",
            enchant: []
        },
        {
            name: "sword",
            enchant: []
        },
        {
            name: "sword",
            enchant: []
        }
    ]
    export let id: number
}
export namespace LOADED {
    let _g_loaded_count = 0
    let _g_callback
    export function add_loaded_count(id) {
        _g_loaded_count++
        console.log(id, _g_loaded_count)
        if (_g_callback) _g_callback()
    }
    export function get_loaded_count() {
        return _g_loaded_count
    }
    export function set_callback(callback) {
        _g_callback = callback
    }
}

export function save() {
    var now = new Date();
    const kigen = 60
    now.setTime(now.getTime() + kigen * 24 * 60 * 60 * 1000);

    let data = { v: SAVEDATA.id ^ 1502, p: (SAVEDATA.id + 12543) * 23 % 8096 }

    document.cookie = "data=" + encodeURIComponent(JSON.stringify(data)) + "; expires=" + now.toUTCString();
}
export function load() {
    /*let str = decodeURIComponent(get_cookieVal("data"))
    if (str == "undefined") return true
    let data = JSON.parse(str)*/
    GLOBAL.FORMATION = SAVEDATA.FORMATION.slice()
    GLOBAL.ITEM = SAVEDATA.ITEM.slice()
    GLOBAL.FORMATION.forEach(n => {
        for (let i = n.data.equip.length; i < 4; i++)n.data.equip.push({})
    })
    for (let i = GLOBAL.ITEM.length; i < 144; i++)GLOBAL.ITEM.push({})
    return true
}
export function get_cookieVal(key) {
    return ((document.cookie + ';').match(key + '=([^¥S;]*)') || [])[1];
}

export function inv_Phi(p: number) {
    let flag = p > 0.5
    if (flag) p = 1 - p
    let i = binary_search(phi, p)
    return (flag ? - i : i) / 100
}
function binary_search(data: number[], key: number) {
    let left = -1, right = data.length, mid: number
    while (right - left > 1) {
        mid = Math.floor((left + right) / 2)
        //console.log("left:" + left + " right:" + right + " mid:" + mid + " data:" + data[mid])
        if (data[mid] < key) right = mid
        else left = mid
    }
    return right
}
//正規分布　phi[i] = Φ(0.01 * i)
const phi = [
    0.5000000, 0.4960110, 0.4920220, 0.4880330, 0.4840470, 0.4800610, 0.4760780, 0.4720970, 0.4681190, 0.4641440,
    0.4601720, 0.4562050, 0.4522420, 0.4482830, 0.4443300, 0.4403820, 0.4364410, 0.4325050, 0.4285760, 0.4246550,
    0.4207400, 0.4168340, 0.4129360, 0.4090460, 0.4051650, 0.4012940, 0.3974320, 0.3935800, 0.3897390, 0.3859080,
    0.3820890, 0.3782810, 0.3744840, 0.3707000, 0.3669280, 0.3631690, 0.3594240, 0.3556910, 0.3519730, 0.3482680,
    0.3445780, 0.3409030, 0.3372430, 0.3335980, 0.3299690, 0.3263550, 0.3227580, 0.3191780, 0.3156140, 0.3120670,
    0.3085380, 0.3050260, 0.3015320, 0.2980560, 0.2945980, 0.2911600, 0.2877400, 0.2843390, 0.2809570, 0.2775950,
    0.2742530, 0.2709310, 0.2676290, 0.2643470, 0.2610860, 0.2578460, 0.2546270, 0.2514290, 0.2482520, 0.2450970,
    0.2419640, 0.2388520, 0.2357620, 0.2326950, 0.2296500, 0.2266270, 0.2236270, 0.2206500, 0.2176950, 0.2147640,
    0.2118550, 0.2089700, 0.2061080, 0.2032690, 0.2004540, 0.1976620, 0.1948940, 0.1921500, 0.1894300, 0.1867330,
    0.1840600, 0.1814110, 0.1787860, 0.1761860, 0.1736090, 0.1710560, 0.1685280, 0.1660230, 0.1635430, 0.1610870,
    0.1586550, 0.1562480, 0.1538640, 0.1515050, 0.1491700, 0.1468590, 0.1445720, 0.1423100, 0.1400710, 0.1378570,
    0.1356660, 0.1335000, 0.1313570, 0.1292380, 0.1271430, 0.1250720, 0.1230240, 0.1210010, 0.1190000, 0.1170230,
    0.1150700, 0.1131400, 0.1112330, 0.1093490, 0.1074880, 0.1056500, 0.1038350, 0.1020420, 0.1002730, 0.0985250,
    0.0968010, 0.0950980, 0.0934180, 0.0917590, 0.0901230, 0.0885080, 0.0869150, 0.0853440, 0.0837930, 0.0822640,
    0.0807570, 0.0792700, 0.0778040, 0.0763590, 0.0749340, 0.0735290, 0.0721450, 0.0707810, 0.0694370, 0.0681120,
    0.0668070, 0.0655220, 0.0642560, 0.0630080, 0.0617800, 0.0605710, 0.0593800, 0.0582080, 0.0570530, 0.0559170,
    0.0547990, 0.0536990, 0.0526160, 0.0515510, 0.0505030, 0.0494710, 0.0484570, 0.0474600, 0.0464790, 0.0455140,
    0.0445650, 0.0436330, 0.0427160, 0.0418150, 0.0409290, 0.0400590, 0.0392040, 0.0383640, 0.0375380, 0.0367270,
    0.0359300, 0.0351480, 0.0343790, 0.0336250, 0.0328840, 0.0321570, 0.0314430, 0.0307420, 0.0300540, 0.0293790,
    0.0287160, 0.0280670, 0.0274290, 0.0268030, 0.0261900, 0.0255880, 0.0249980, 0.0244190, 0.0238520, 0.0232950,
    0.0227500, 0.0222160, 0.0216920, 0.0211780, 0.0206750, 0.0201820, 0.0196990, 0.0192260, 0.0187630, 0.0183090,
    0.0178640, 0.0174290, 0.0170030, 0.0165860, 0.0161770, 0.0157780, 0.0153860, 0.0150030, 0.0146290, 0.0142620,
    0.0139030, 0.0135530, 0.0132090, 0.0128740, 0.0125450, 0.0122240, 0.0119110, 0.0116040, 0.0113040, 0.0110110,
    0.0107240, 0.0104440, 0.0101700, 0.0099030, 0.0096420, 0.0093870, 0.0091370, 0.0088940, 0.0086560, 0.0084240,
    0.0081980, 0.0079760, 0.0077600, 0.0075490, 0.0073440, 0.0071430, 0.0069470, 0.0067560, 0.0065690, 0.0063870,
    0.0062100, 0.0060370, 0.0058680, 0.0057030, 0.0055430, 0.0053860, 0.0052340, 0.0050850, 0.0049400, 0.0047990,
    0.0046610, 0.0045270, 0.0043970, 0.0042690, 0.0041450, 0.0040250, 0.0039070, 0.0037930, 0.0036810, 0.0035730,
    0.0034670, 0.0033640, 0.0032640, 0.0031670, 0.0030720, 0.0029800, 0.0028900, 0.0028030, 0.0027180, 0.0026350,
    0.0025550, 0.0024770, 0.0024010, 0.0023270, 0.0022560, 0.0021860, 0.0021180, 0.0020520, 0.0019880, 0.0019260,
    0.0018660, 0.0018070, 0.0017500, 0.0016950, 0.0016410, 0.0015890, 0.0015380, 0.0014890, 0.0014410, 0.0013950,
    0.0013500, 0.0013060, 0.0012640, 0.0012230, 0.0011830, 0.0011440, 0.0011070, 0.0010700, 0.0010350, 0.0010010,
    0.0009680, 0.0009360, 0.0009040, 0.0008740, 0.0008450, 0.0008160, 0.0007890, 0.0007620, 0.0007360, 0.0007110,
    0.0006870, 0.0006640, 0.0006410, 0.0006190, 0.0005980, 0.0005770, 0.0005570, 0.0005380, 0.0005190, 0.0005010,
    0.0004830, 0.0004670, 0.0004500, 0.0004340, 0.0004190, 0.0004040, 0.0003900, 0.0003760, 0.0003620, 0.0003500,
    0.0003370, 0.0003250, 0.0003130, 0.0003020, 0.0002910, 0.0002800, 0.0002700, 0.0002600, 0.0002510, 0.0002420,
    0.0002330, 0.0002240, 0.0002160, 0.0002080, 0.0002000, 0.0001930, 0.0001850, 0.0001790, 0.0001720, 0.0001650,
    0.0001590, 0.0001530, 0.0001470, 0.0001420, 0.0001360, 0.0001310, 0.0001260, 0.0001210, 0.0001170, 0.0001120,
    0.0001080, 0.0001040, 0.0000996, 0.0000958, 0.0000920, 0.0000884, 0.0000850, 0.0000816, 0.0000784, 0.0000753,
    0.0000724, 0.0000695, 0.0000667, 0.0000641, 0.0000615, 0.0000591, 0.0000567, 0.0000544, 0.0000522, 0.0000501,
    0.0000481, 0.0000462, 0.0000443, 0.0000425, 0.0000408, 0.0000391, 0.0000375, 0.0000360, 0.0000345, 0.0000331,
    0.0000317, 0.0000304, 0.0000291, 0.0000279, 0.0000267, 0.0000256, 0.0000245, 0.0000235, 0.0000225, 0.0000216,
    0.0000207, 0.0000198, 0.0000190, 0.0000181, 0.0000174, 0.0000166, 0.0000159, 0.0000152, 0.0000146, 0.0000140,
    0.0000134, 0.0000128, 0.0000122, 0.0000117, 0.0000112, 0.0000107, 0.0000102, 0.0000098, 0.0000094, 0.0000089,
    0.0000085, 0.0000082, 0.0000078, 0.0000075, 0.0000071, 0.0000068, 0.0000065, 0.0000062, 0.0000059, 0.0000057,
    0.0000054, 0.0000052, 0.0000049, 0.0000047, 0.0000045, 0.0000043, 0.0000041, 0.0000039, 0.0000037, 0.0000036,
    0.0000034, 0.0000032, 0.0000031, 0.0000030, 0.0000028, 0.0000027, 0.0000026, 0.0000024, 0.0000023, 0.0000022,
    0.0000021, 0.0000020, 0.0000019, 0.0000018, 0.0000017, 0.0000017, 0.0000016, 0.0000015, 0.0000014, 0.0000014,
    0.0000013, 0.0000012, 0.0000012, 0.0000011, 0.0000011, 0.0000010, 0.0000010, 0.0000009, 0.0000009, 0.0000008,
    0.0000008, 0.0000008, 0.0000007, 0.0000007, 0.0000007, 0.0000006, 0.0000006, 0.0000006, 0.0000005, 0.0000005,
    0.0000005, 0.0000005, 0.0000004, 0.0000004, 0.0000004, 0.0000004, 0.0000004, 0.0000003, 0.0000003, 0.0000003,
    0.0000003, 0.0000003, 0.0000003, 0.0000002, 0.0000002, 0.0000002, 0.0000002, 0.0000002, 0.0000002, 0.0000002
]