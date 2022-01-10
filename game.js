
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
const JUMP_FORCE = 400
const BIG_JUMP_FORCE = 550
let CURRENT_JUMP_FORCE = JUMP_FORCE
const FALL_DEATH = 400
ENEMY_SPEED = 30

let isJumping = true

scene("game", ({ level, score }) => {
  layers(['bg', 'obj', 'ui'], 'obj')

  const maps = [
    [
      '                                      ',
      '                                      ',
      '                   $$$$$              ',
      '                   =====              ',
      '                                      ',
      '     ~     =*=%=                      ',
      '                                      ',
      '                            -+        ',
      '                    ^   ^   ()        ',
      '=======      =================   =====',
      '=======      =====|^    |=====   =====',
      '======|     ^|================   =====',
      '==============================   =====',
    ],
    [
      '£                                     £',
      '£                                     £',
      '£                                     £',
      '£                                     £',
      '£                                     £',
      '£       @@@@@@             x x        £',
      '£                        x x x        £',
      '£                      x x x x  x   -+£',
      '£             z   z  x x x x x  x   ()£',
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    ]
  ]

  const levelCfg = {
      width: 21,
      height: 21,
      '=': () => [sprite('block'), solid()],
      '|': () => [sprite('block'), solid(), 'wall'],
      '$': () => [sprite('coin'), 'coin'],
      '%': () => [sprite('surprise'), solid(), 'coin-surprise'],
      '*': () => [sprite('surprise'), solid(), 'mushroom-surprise'],
      '~': () => [sprite('surprise'), solid(), 'shroom-surprise'],
      '}': () => [sprite('unboxed'), solid()],
      '(': () => [sprite('pipe-bottom-left'), solid(), scale(0.5), 'wall'],
      ')': () => [sprite('pipe-bottom-right'), solid(), scale(0.5), 'wall'],
      '-': () => [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe', 'wall'],
      '+': () => [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe','wall'],
      '^': () => [sprite('evil-shroom'), {dir: -1}, body(), 'dangerous'], 
      '#': () => [sprite('mushroom'), solid(), 'mushroom', body()],
      '!': () => [sprite('blue-block'), solid(), scale(0.5)],
      '£': () => [sprite('blue-brick'), solid(), 'wall', scale(0.5)],
      'z': () => [sprite('blue-evil-shroom'), {dir: -1}, body(), scale(0.5), 'dangerous'],
      '@': () => [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
      'x': () => [sprite('blue-steel'), solid(), 'wall', scale(0.5)],

  }

  const gameLevel = addLevel(maps[level], levelCfg)

  const scoreLabel = add([
      text( score ),
      pos(10, 6),
      layer('ui'),
      {
          value: score,
      }
  ])

  add([text('level ' + parseInt( level + 1) ), pos(40, 6)])

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
      pos(40,0),
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
      if (obj.is('shroom-surprise')) {
        gameLevel.spawn('^', obj.gridPos.sub(0, 1)) //spawns mushroom
        destroy(obj)
        gameLevel.spawn('}', obj.gridPos.sub(0, 0)) // spawns block on surprise block
      }
  })

  player.collides('mushroom', (m) => {
     destroy(m)
     updateScore(100)
     displayEarnedPoint('+100')
     player.biggify(6)
  })

  function updateScore(point) {
    scoreLabel.value += point
    scoreLabel.text = scoreLabel.value
  }

  player.collides('coin', (c) => {
    destroy(c)
    displayEarnedPoint("+5")
    updateScore(5)
  })

  action('dangerous', (d) => {
    d.move(d.dir * ENEMY_SPEED, 0)
  })

  collides('dangerous', 'wall', (d) => {
    d.dir = -d.dir
  })

  // displays point_str above mario earned immediatley for 1 second
  function displayEarnedPoint(point_str) {
    const earnPointText = 
    add([
      pos(player.pos.x, player.pos.y - 5),
      text(point_str)
    ])
    wait(1, () => {
      destroy(earnPointText)
    })
  }

  player.collides('dangerous', (d) => {
    if (isJumping) {
      destroy(d)
      updateScore(10)
      displayEarnedPoint("+10")
    } else {
      go('lose', { score: scoreLabel.value})
    }
  })

  player.action( () => {
    camPos(player.pos)
    if (player.pos.y >= FALL_DEATH) {
      go('lose', {score: scoreLabel.value})
    }
  })

  player.collides('pipe', () => {
    keyPress('down', () => {
      go('game', {
        level: (level + 1) % maps.length,
        score: scoreLabel.value
      })
    })
  })

  keyDown('left', () => {
      player.move(-MOVE_SPEED, 0)
  })

  keyDown('right', () => {
      player.move(MOVE_SPEED, 0)
  })

  player.action( () => {
    if (player.grounded()) {
      isJumping = false
    } else {
      isJumping = true
    }
  })

  keyPress('space', () => {
      if(player.grounded()) {
          isJumping = true
          player.jump(CURRENT_JUMP_FORCE)
      }
  })

})

scene('lose', ({ score }) => {
add([text('GAME OVER', 34), origin('center'), pos(width()/2, height()/6)])
add([text('score', 32), origin('center'), pos(width()/2, height()/4)])
add([text(score, 32), origin('center'), pos(width()/2, height()/2)])
})

start("game", { level: 0, score: 0})

