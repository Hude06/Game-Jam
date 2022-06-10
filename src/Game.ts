import {
    BaseParentView,
    BaseView,
    CanvasSurface,
    KEYBOARD_DOWN,
    LayerView,
    log,
    Point,
    randi,
    Rect,
    Sheet,
    Size,
    Sprite,
    SpriteFont,
    Tilemap,
} from "thneed-gfx";
// @ts-ignore
import snake_json from "./Game.json";
import {GridModel} from "./models";
import {Doc} from "./app-model";
// @ts-ignore
import IdleImage from "../assets/Free/Main Characters/Virtual Guy/Jump.png"
// @ts-ignore
import Fruit from "../assets/Free/Items/Fruits/Melon.png"

import { type } from "express/lib/response";
var GRAVITY = 0.01    
const JUMP_POWER = -0.3
const gravitySpeed = 0;
const SCALE = 3
const START_POSITION = new Point(15, 18)
const CANVAS_SIZE = new Size(46, 20)
const BOARD_SIZE = new Size(20, 20)
const EMPTY = 0;
const WALL = 1;
const BAKEN = 4;
const BILL_POSITION = new Point(8 * SCALE * 0, 8 * SCALE * 0)
const GRID_POSITION = new Point(8 * SCALE * 12, 8 * SCALE * 0)
const SCORE_POSITION = new Point(8 * SCALE * 16, 8 * SCALE * 0)
const HOME_POSTION = new Point(14 * SCALE * -4, 8 * SCALE * 0)
const ROOM_POSTION = new Point(14 * SCALE * -4, 8 * SCALE * 0)

class PlayerModel {
    position: Point
    direction: Point
    speed: number
    length: number
    vx: number
    can_jump: boolean

    constructor() {
        this.position = new Point(0, 0)
        this.direction = new Point(0, -1)
        this.speed = 0
        this.length = 1
        this.vx = 0
        this.can_jump = false
    }

}

class ScoreModel {
    start_time: number;
    CookedBaken: number;

    constructor() {
        this.CookedBaken = 0
    }
}

class GridView extends BaseParentView {
    private model: GridModel;
    private wall_left: Sprite;
    private wall_right: Sprite;
    private empty: Sprite;
    private baken: Sprite;
    private wall_top: Sprite;
    private wall_bottom: Sprite;

    constructor(model: GridModel, sheet: Sheet) {
        super('grid-view')
        this.model = model;
        this.wall_left = sheet.sprites.find(s => s.name === 'wall_left')
        this.wall_right = sheet.sprites.find(s => s.name === 'wall_right')
        this.wall_top = sheet.sprites.find(s => s.name === 'wall_top')
        this.wall_bottom = sheet.sprites.find(s => s.name === 'wall_bottom')
        this.empty = sheet.sprites.find(s => s.name === 'ground')
        this.baken = sheet.sprites.find(s => s.name === 'baken')

    }

    draw(g: CanvasSurface): void {
        g.ctx.imageSmoothingEnabled = false
        g.fillBackgroundSize(this.size(), 'white')
        this.model.forEach((w, x, y) => {
            let color = 'white'
            if (w === EMPTY) color = 'white'
            if (w === WALL) color = 'teal'
            let xx = x * 8 * SCALE
            let yy = y * 8 * SCALE
            g.fill(new Rect(xx, yy, 1 * 8 * SCALE, 1 * 8 * SCALE), color);
            let pt = new Point(xx,yy)
            if (w === EMPTY) g.draw_sprite(pt, this.empty)
            if (w === WALL) {
                if (x === 0) g.draw_sprite(pt, this.wall_left)
                if (x === this.model.w - 1) g.draw_sprite(pt, this.wall_right)
                if (y === 0) g.draw_sprite(pt, this.wall_top)
                if (y === this.model.w - 1) g.draw_sprite(pt, this.wall_bottom)
            }
            if (w === BAKEN) g.draw_sprite(pt, this.baken,)




        })
    }

    layout(g: CanvasSurface, available: Size): Size {
        this.set_size(new Size(this.model.w * 8 * SCALE, this.model.h * 8 * SCALE))
        return this.size()
    }

    set_visible(visible: boolean) {
        this._visible = visible
    }

}

  
// class BakenView extends BaseView {
//     private model: PlayerModel;
//     private sprite_slice: Sprite;

//     constructor(model: BakenModel, spritesheet: Sheet) {
//         super('baken')
//         this.model = model;
//         this.sprite_slice = spritesheet.sprites.find(sp => sp.name === 'baken')
//         this.set_size(new Size(8 * SCALE, 8 * SCALE))
//     }

//     draw(g: CanvasSurface): void {
//         g.ctx.imageSmoothingEnabled = false
//         // g.fill(new Rect(0,0,16,16),'#ff0000')
//         g.draw_sprite(GRID_POSITION, this.sprite_slice)
//     }

//     position(): Point {
//         return new Point(
//             this.model.position.x * 8 * SCALE,
//             this.model.position.y * 8 * SCALE
//         )
//     }

//     layout(g: CanvasSurface, available: Size): Size {
//         return this.size()
//     }
// }

class ScoreView extends BaseView {
    private score: ScoreModel;
    private font: SpriteFont;
    private Baken: PlayerModel;

    constructor(score: ScoreModel, baken: PlayerModel, font: SpriteFont, coin_sprite:Sprite) {
        super('score-view')
        this.score = score;
        this.Baken == baken;
        this.font = font;
    }

    draw(g: CanvasSurface): void {
        g.ctx.save()
        g.ctx.translate(this.position().x, this.position().y)
        // g.fillBackgroundSize(this.size(),'red')
        this.set_size(new Size(400, 480))
        g.fillBackgroundSize(this.size(), '#70ffd0')


        let lines = [



        ]
        lines.forEach((str, i) => {
            g.fillStandardText(str, 10, 16 * i * 4 + 32, 'base', 2)
        })
        g.ctx.restore()
    }

    layout(g: CanvasSurface, available: Size): Size {
        return this.size()
    }
}

class BillView extends BaseView {
    private score: ScoreModel;
    private font: SpriteFont;
    private Baken: PlayerModel;
    private last_time: number;

    constructor(score: ScoreModel, baken: PlayerModel, font: SpriteFont) {
        super('score-view')
        this.score = score;
        this.Baken == baken;
        this.font = font;
    }

    draw(g: CanvasSurface): void {
        g.ctx.save()
        let current = Date.now()
        let diff = current - this.score.start_time
        let diff_seconds = Math.floor(diff / 1000)
        this.last_time = diff_seconds
        g.fillBackgroundSize(this.size(), '#70ffd0')
        let lines = [
            // `Bill ${this.score.bill}`,
            // `Coins ${this.score.coin}`,
            // `CookedBaken ${this.score.CookedBaken}`,


        ]
        lines.forEach((str, i) => {
            g.fillStandardText(str, 10, 16 * i * 4 + 32, 'base', 2)
        })
        g.ctx.restore()
    }

    layout(g: CanvasSurface, available: Size): Size {
        this.set_size(new Size(289, 480))
        return this.size()
    }
}



class RoomView extends BaseView {
    // private score: ScoreModel;
    // private font: SpriteFont;
    // private Baken: BakenModel;

    constructor() {
        super('score-view')
        // this.score = score;
        // this.Baken == baken;
        // this.font = font;

    }

    set_visible(visible: boolean) {
        this._visible = visible
    }

    draw(g: CanvasSurface): void {
        g.ctx.save()
        g.ctx.translate(this.position().x, this.position().y)
        // g.fillBackgroundSize(this.size(),'red')
        //this.set_size(new Size(,480))
        g.fillBackgroundSize(this.size(), '#a9aaaa')


        let lines = [
            // `Baken ${this.score.lives}`,
            // `Coins ${this.score.coin}`,
            // `CookedBaken ${this.score.CookedBaken}`,


        ]
        lines.forEach((str, i) => {
            g.fillStandardText(str, 10, 16 * i * 4 + 32, 'base', 2)
        })
        g.ctx.restore()
    }
    

    layout(g: CanvasSurface, available: Size): Size {
        this.set_size(new Size(8 * SCALE * 18, 8 * SCALE * 18))
        return this.size()
    }
}

class SplashView extends BaseView {
    constructor() {
        super('splash-view');
    }

    draw(g: CanvasSurface): void {
        g.fillBackgroundSize(this.size(), 'rgba(255,255,255,1.0)')
        g.ctx.save()
        g.ctx.strokeStyle = 'black'
        g.ctx.lineWidth = 4
        g.ctx.strokeRect(4, 4, this.size().w - 4 * 2, this.size().h - 4 * 2)
        g.ctx.restore()
        let x = 340
        g.fillBackgroundSize(this.size(), 'rgba(51,255,175')
        g.fillStandardText('Cook The Baken', x, 145, 'base', 2)
        let lines = [
            'Arrow keys to move',
            `'p' switch colors`,
            'Press Any Key To Start'
        ]
        lines.forEach((str, i) => {
            g.fillStandardText(str, 262, 220 + i * 32, 'base', 1)
        })

    }

    layout(g: CanvasSurface, available: Size): Size {
        this.set_size(available)
        return this.size()
    }

    set_visible(visible: boolean) {
        this._visible = visible
    }
}
class DialogView extends BaseView {
    private text: string;
    private map: Tilemap;
    private sheet: Sheet;
    constructor(map: Tilemap, sheet: Sheet) {
        super('dialog-view');
        this.map = map
        this.sheet = sheet
    }
    draw(g: CanvasSurface): void {
        g.fillBackgroundSize(this.size(), 'rgba(255,255,255,0.0)')
        let sprite_w = this.sheet.sprites[0].w
        let map_w = this.map.w * sprite_w * SCALE
        let map_scale = SCALE * sprite_w
        let map_x = (this.size().w - map_w) / 2
        let text_w = g.measureText(this.text, 'base').w * 2
        let text_x = (this.size().w - text_w) / 2
        g.draw_tilemap(this.map, this.sheet, map_x, 16, map_scale)
        g.fillStandardText(this.text, text_x, 150, 'base', 2)
    }

    layout(g: CanvasSurface, available: Size): Size {
        this.set_size(available)
        return this.size()
    }

    set_visible(visible: boolean) {
        this._visible = visible
    }

    set_text(died: string) {
        this.text = died
    }
}

class PlayerView extends BaseView {
    private image
    private image2

    private model: PlayerModel;
    constructor(model:PlayerModel) {
        super('image-view')
        this.model = model
        this.image = new Image()
        this.image2 = new Image()

        this.image.src = IdleImage
        this.image2.src = Fruit
    }
    draw(g: CanvasSurface):void {
        // g.fillBackgroundSize(this.size(),'red')
        g.ctx.save()
        g.ctx.translate(GRID_POSITION.x, GRID_POSITION.y)
        g.ctx.drawImage(this.image, 
            this.model.position.x*8*SCALE - 5,
            this.model.position.y*8*SCALE - 7,
            //32,
            //32,
            )
            g.ctx.drawImage(this.image2, 
                this.model.position.x*8*SCALE - 5,
                this.model.position.y*8*SCALE - 7,
                //32,
                //32,
                )
        // g.ctx.strokeRect(this.model.position.x*8*SCALE, this.model.position.y*8*SCALE,8*SCALE,8*SCALE)
        g.ctx.beginPath();
        g.ctx.fill()


        g.ctx.restore()
    }
    layout(g: CanvasSurface, available: Size): Size {
        this.set_size(available)
        return this.size()
    }
}


export async function start() {
    log("starting", snake_json)
    let doc = new Doc()
    doc.reset_from_json(snake_json)
    let surface = new CanvasSurface(CANVAS_SIZE.w * 8 * SCALE, CANVAS_SIZE.h * 8 * SCALE);
    surface.set_smooth_sprites(false)
    surface.set_sprite_scale(3)
    surface.load_jsonfont(doc, 'base', 'base')
    let root = new LayerView()
    let baken = new PlayerModel()
    baken.position.copy_from(START_POSITION);
    let board = new GridModel(BOARD_SIZE)
    board.fill_all(() => EMPTY)
    let board_layer = new LayerView();
    board_layer.set_name('board')
    let board_view = new GridView(board, doc.sheets[0])
    board_view.set_position(GRID_POSITION)
    board_layer.add(board_view);
    root.add(board_layer);

    let home_view = new DialogView(doc.maps.find(m => m.name === 'home'), doc.sheets[0]);
    root.add(home_view)
    home_view.set_position(HOME_POSTION)
    home_view.set_visible(false)

    
    // let baken_view = new BakenView(baken, doc.sheets[0])
    // root.add(baken_view)


    let image_view = new PlayerView(baken);
    root.add(image_view)


    let score = new ScoreModel()
    let score_view = new ScoreView(score, baken, doc.fonts[0],doc.sheets[0].sprites.find(s => s.name === 'Coin'))

    score_view.set_position(SCORE_POSITION)
    board_layer.add(score_view)

    let bill = new BillView(score, baken, doc.fonts[0])
    bill.set_position(BILL_POSITION)
    board_layer.add(bill)



    
    let room_view = new RoomView();
    room_view.set_position(ROOM_POSTION)
    root.add(room_view)


    room_view.set_visible(false)

    let splash_layer = new SplashView();
    root.add(splash_layer);

    // first button
    // const world_button = document.getElementById('world-button')
    // world_button.addEventListener('click', () => {
    //     toaster_view.set_visible(false)
    //     world_button.classList.remove("visible")
    //     toast.classList.remove("visible")

    // })

    // let pay_button = document.getElementById("pay-button")
    // pay_button.addEventListener('click', () => {
    //     if (score.coin > 1) {
    //         score.bill -= 1
    //         score.coin -= 1
    //     }
    // })

    // let toast = document.getElementById("toast")
    // toast.addEventListener('click', () => {
    //     if (score.lives >= 1) {
    //         score.lives -= 1
    //         score.CookedBaken += 1
    //     }
    // })


    let dialog_layer = new DialogView(doc.maps.find(m => m.name === 'dialog'), doc.sheets[0]);
    root.add(dialog_layer)
    dialog_layer.set_visible(false)

    surface.set_root(root);
    surface.start()


    surface.on_input((e) => {
        if (e.type === KEYBOARD_DOWN) {
            if (gameover) {
                splash_layer.set_visible(false)
                gameover = false
                playing = true
                // pay_button.classList.add("visible")
                nextLevel()
            }

            if (e.key === 'ArrowLeft' || e.key==='a') turn_to(new Point(-1  , 0));
            if (e.key === 'ArrowRight' || e.key==='d') turn_to(new Point(+1, 0));
            if (e.key === 'ArrowUp' || e.key==='w') {
                if(baken.can_jump === true) {
                    baken.vx = JUMP_POWER
                    turn_to(new Point(+0, - 2));
                }
            }
        }
    })
    let playing = false
    let gameover = true

    function restart() {
        // score.lives = 0
        // score.coin = 0
        // score.bill = 0
        score.start_time = Date.now()
        score.CookedBaken = 0

        baken.position.copy_from(START_POSITION);
    }

    // function spawn_object(type:number) {
    //     while (true) {
    //         let pt = new Point(randi(1,16), randi(1,16))
    //         if(board.get_at(pt) === EMPTY) {
    //             board.set_at(pt, type)
    //             break;
    //         }
    //     }
    // }
    function nextLevel() {
        board.fill_all(() => EMPTY);
        board.fill_row(0, () => WALL)
        board.fill_col(0, () => WALL)
        board.fill_row(board.h - 1, () => WALL)
        board.fill_col(board.w - 1, () => WALL)
        // board.set_at(new Point(randi(1, 16), 7), BAKEN )
        // board.set_at(new Point(10, 1), TOSTER)
        // board.set_at(new Point(19,9), DOOR)
        // spawn_object(COIN)
        // spawn_object(BAKEN)

    }

    let clock = 0

    function turn_to(off) {
        let new_position = baken.position.add(off)
        let tile_position = new Point(Math.floor(new_position.x), Math.floor(new_position.y)+1)
        let spot = board.get_at(tile_position)
        board.set_xy(9,16,WALL)
        board.set_xy(10,13,WALL)
        board.set_xy(12,11,WALL)
        board.set_xy(1,11,WALL)
        board.set_xy(2,11,WALL)
        board.set_xy(3,11,WALL)
        board.set_xy(4,11,WALL)
        board.set_xy(5,11,WALL)


        if (spot === WALL) {
            baken.can_jump = true
            baken.vx = 0
            return
        } else {
            baken.can_jump = false
        }
        baken.position = new_position
    }


    function process_tick() {
        clock += 1
        baken.vx += GRAVITY
        turn_to(new Point(+0, baken.vx))
    }

    restart()

    function refresh() {
        if (playing) process_tick()
        surface.repaint()
        requestAnimationFrame(refresh)
    }

    requestAnimationFrame(refresh)

}



