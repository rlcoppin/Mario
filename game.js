kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1],

})

loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png')
loadSprite('evil-shroom', 'KPO3fR9.png')
loadSprite('brick', 'pogC9x5.png')
loadSprite('block', 'M6rwarW.png')
loadSprite('mario', 'Wb1qfhK.png')
loadSprite('mushroom', '0wMd92p.png')
loadSprite('surprise', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-top-left', 'ReTPiWY.png')
loadSprite('pipe-top-right', 'hj2GK4n.png')
loadSprite('pipe-bottom-left', 'c1cYSbt.png')
loadSprite('pipe-bottom-right', 'nqQ79eI.png')
loadSprite('blue-block', 'fVscIbn.png')
loadSprite('blue-brick', '3e5YRQd.png')
loadSprite('blue-steel', 'gqVoI2b.png')
loadSprite('blue-evil-shroom', 'SvV4ueD.png')
loadSprite('blue-surprise', 'RMqCc1G.png')

const MOVE_SPEED = 120
const JUMP_FORCE = 360
const BIG_JUMP_FORCE = 550
let CURRENT_JUMP_FORCE = JUMP_FORCE

scene("game", () => {
    layers(['bg', 'obj', 'ui'], 'obj')

    const map = [
        '                                      ',
        '                                      ',
        '                                      ',
        '                                      ',
        '                                      ',
        '     %   =*=%=                        ',
        '                                      ',
        '                            -+        ',
        '                    ^   ^   ()        ',
        '==============================   =====',
    ]

    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('block'), solid()],
        '$': [sprite('coin'), 'coin'],
        '%': [sprite('surprise'), solid(), 'coin-surprise'],
        '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
        '}': [sprite('unboxed'), solid()],
        '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
        ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
        '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
        '^': [sprite('evil-shroom'), solid(), 'dangerous'],
        '#': [sprite('mushroom'), solid(), 'mushroom', body()],
        '!': [sprite('blue-block'), solid(), scale(0.5)],
        '£': [sprite('blue-brick'), solid(), scale(0.5)],
        'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
        '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
        'x': [sprite('blue-steel'), solid(), scale(0.5)],

    }

    const gameLevel = addLevel(map, levelCfg)

    const scoreLabel = add([
        text('test'),
        pos(30,6),
        layer('ui'),
        {
            value: 'test',
        }
    ])

    add([text('level ' + 'test', pos(4, 6))])

    function big() {
        let timer = 0
        let isBig = false
        return {
          update() {
            if (isBig) {
              CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
              timer -= dt()
              if (timer <= 0) {
                this.smallify()
              }
            }
          },
          isBig() {
            return isBig
          },
          smallify() {
            this.scale = vec2(1)
            CURRENT_JUMP_FORCE = JUMP_FORCE
            timer = 0
            isBig = false
          },
          biggify(time) {
            this.scale = vec2(2)
            timer = time
            isBig = true     
          }
        }
      }
    const player = add([
        sprite('mario'), solid(),
        pos(30,0),
        body(),
        big(), 
        origin('bot'),

    ])

    action('mushroom', (m) => {
      m.move(10,0) // move mushroom on y-axis
    })

    //player headbumps 
    player.on("headbump", (obj) => {
        if (obj.is('coin-surprise')) {
            gameLevel.spawn('$', obj.gridPos.sub(0, 1)) //spawns coin
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0, 0)) // spawns block on surprise block
        }
        if (obj.is('mushroom-surprise')) {
          gameLevel.spawn('#', obj.gridPos.sub(0, 1)) //spawns mushroom
          destroy(obj)
          gameLevel.spawn('}', obj.gridPos.sub(0, 0)) // spawns block on surprise block
      }
    })

    keyDown('left', () => {
        player.move(-MOVE_SPEED, 0)
    })

    keyDown('right', () => {
        player.move(MOVE_SPEED, 0)
    })

    keyPress('space', () => {
        if(player.grounded()) {
            player.jump(CURRENT_JUMP_FORCE)
        }
    })

})

start("game")