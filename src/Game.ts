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
import IdleImage from "../Main Characters/Virtual Guy/Jump.png"
// @ts-ignore
import Fruit from "../assets/Free/Items/Fruits/Strawberry.png"
import { type } from "express/lib/response";


var GRAVITY = 0.02
const JUMP_POWER = -0.5
const SCALE = 3
const START_POSITION = new Point(15, 18)
const CANVAS_SIZE = new Size(46, 20)
const BOARD_SIZE = new Size(20, 20)
const EMPTY = 0;
const WALL = 1;
const FRUIT = 2;
const MONSTER = 3;
const GRID_POSITION = new Point(8 * SCALE * 12, 8 * SCALE * 0)

class PlayerModel {
    position: Point
    direction: Point
    speed: number
    length: number
    vx: number
    can_jump: boolean
    FruitVisable: boolean

    constructor() {
        this.position = new Point(0, 0)
        this.direction = new Point(0, -1)
        this.speed = 0
        this.length = 1
        this.vx = 0
        this.can_jump = false
        this.FruitVisable = true

    }

}




class GridView extends BaseParentView {
    private model: GridModel;
    private wall_left: Sprite;
    private wall_right: Sprite;
    private empty: Sprite;
    private wall_top: Sprite;
    private wall_bottom: Sprite;
    private sprite

    constructor(model: GridModel, sheet: Sheet) {
        super('grid-view')
        this.model = model;
        this.wall_left = sheet.sprites.find(s => s.name === 'wall_left')
        this.wall_right = sheet.sprites.find(s => s.name === 'wall_right')
        this.wall_top = sheet.sprites.find(s => s.name === 'wall_top')
        this.wall_bottom = sheet.sprites.find(s => s.name === 'wall_bottom')
        this.empty = sheet.sprites.find(s => s.name === 'ground')

    }

    draw(g: CanvasSurface): void {
        g.ctx.imageSmoothingEnabled = false
        g.fillBackgroundSize(this.size(), 'white')
        this.sprite = new Image()
        this.sprite.src = Fruit

        this.model.forEach((w, x, y) => {
            let color = 'white'
            if (w === EMPTY) color = 'white'
            if (w === WALL) color = 'teal'
            if (w === MONSTER) color = 'orange'

            let xx = x * 8 * SCALE
            let yy = y * 8 * SCALE
            g.fill(new Rect(xx, yy, 1 * 8 * SCALE, 1 * 8 * SCALE), color);
            let pt = new Point(xx,yy)
            if (w === EMPTY) g.draw_sprite(pt, this.empty)
            if (w === FRUIT) g.ctx.drawImage(this.sprite, 300 ,26, 700,40)
            if (w === WALL) {
                if (x === 0) g.draw_sprite(pt, this.wall_left)
                if (x === this.model.w - 1) g.draw_sprite(pt, this.wall_right)
                if (y === 0) g.draw_sprite(pt, this.wall_top)
                if (y === this.model.w - 1) g.draw_sprite(pt, this.wall_bottom)
            }
                    



        })
    }

    layout(g: CanvasSurface, available: Size): Size {
        this.set_size(new Size(this.model.w * 8 * SCALE, this.model.h * 6 * SCALE))
        return this.size()
    }

    set_visible(visible: boolean) {
        this._visible = visible
    }

}





class SplashView extends BaseView {
    constructor() {
        super('splash-view');
    }

    draw(g: CanvasSurface): void {
        g.fillBackgroundSize(this.size(), 'rgba(66, 135, 245)')
        g.ctx.save()
        g.ctx.strokeStyle = 'black'
        g.ctx.lineWidth = 4
        g.ctx.strokeRect(4, 4, this.size().w - 4 * 2, this.size().h - 4 * 2)
        g.ctx.restore()
        let x = 340
        g.fillBackgroundSize(this.size(), 'rgba(51,255,175')
        g.fillStandardText('UnderCooked', x, 145, 'base', 2)
        let lines = [
            'Arrow keys to move',
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


class PlayerView extends BaseView {
    private image

    private model: PlayerModel;
    constructor(model:PlayerModel) {
        super('image-view')
        this.model = model
        this.image = new Image()
        this.image.src = IdleImage
        //this.image2.src = Fruit
    }
    draw(g: CanvasSurface):void {
        // g.fillBackgroundSize(this.size(),'red')
        g.ctx.save()
        g.ctx.translate(GRID_POSITION.x, GRID_POSITION.y)
        g.ctx.drawImage(this.image, 
            this.model.position.x*8*SCALE - 5,
            this.model.position.y*8*SCALE - 7,)
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



    
    // let baken_view = new BakenView(baken, doc.sheets[0])
    // root.add(baken_view)


    let image_view = new PlayerView(baken);
    root.add(image_view)
    let splash_layer = new SplashView();
    root.add(splash_layer);

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


        baken.position.copy_from(START_POSITION);
    }

    function nextLevel() {
        board.fill_all(() => EMPTY);
        board.fill_row(0, () => WALL)
        board.fill_col(0, () => WALL)
        board.fill_row(board.h - 1, () => WALL)
        board.fill_col(board.w - 1, () => WALL)

    }


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
        board.set_xy(1,5,MONSTER)


        if (baken.FruitVisable === true) {
        board.set_xy(8, 11, FRUIT)
        } else {

        }
        if (spot === FRUIT) {
            baken.can_jump = true
            baken.FruitVisable = false
            baken.vx = 0

            board.set_xy(8,11,EMPTY)
            return
        }
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



