/*:
@target MZ
@plugindesc A collection of casino games.
@author reflector88
@url https://reflector88.itch.io/
@help 
"Casino 1.02"
A collection of casino minigames, including Baccarat, Blackjack, 
Craps, Roulette, Slots, and Video Poker.

Update
v1.01 - HOTFIX, Fixed some potential framerate issues
v1.02 - Fixed bug where you could play Slots/Poker without money
______________________________________________________________________
CONFIGURATION
You can set your bankroll equal to in-game currency or a variable.
Launch games using plugin commands.

1, 2, 3, 4 can be used to select the chips, Z or Space to Place Bet,
and X or Esc to exit to map.

NOTE: Currently based on the default screen size of 816x624, so the
graphics will look strange if you use a higher or lower resolution.
May add resolution scaling in the future.
______________________________________________________________________
TERMS OF USE
This plugin is free for non-commercial use. If you plan on using this
in a paid project, please contact me first at reflector88@gmail.com.
Either way, credit me if you found it helpful. Please do not repost
this script (or any modified version) anywhere.

@param Chip Values
@type string
@desc The money value of each chip type.
@default [5, 10, 25, 100]

@param Use Variable as Currency
@type variable
@desc If set to 0, game will use in-game currency.
@default 0

@param Currency Unit
@type string
@desc The currency symbol.
@default $

@param Currency Position
@type select
@desc Whether the currency symbol comes before or after the number.
@option Before @option After
@default Before

@param Slot Payouts
@type string
@desc The winnings of each slot combination.
@default [0, 6, 15, 20, 30, 60, 300, 10000]

@command Baccarat
@text Launch Baccarat

@command Blackjack
@text Launch Blackjack

@command Craps
@text Launch Craps

@command Roulette
@text Launch Roulette

@command Slots
@text Launch Slots

@command VideoPoker
@text Launch Video Poker

*/

'use strict';

var r88 = r88 || {};
r88.Casino = r88.Casino || {};
r88.Casino.parameters = PluginManager.parameters('r88_Casino');

//-----------------------------------------------------------------------------
// Component Classes
//
// The classes for UI components.

r88.Casino.Button = class extends Sprite_Button {
   isVisible = true;
   isPayable = true;

   loadButtonImage() {
      this.bitmap = ImageManager.loadPicture("r88_Casino_pictures/CGButtonSet");
   }

   setupFrames() {
      const data = this.buttonData();
      const x = data.x * this.blockWidth();
      const y = data.y * this.blockHeight();
      const width = data.w * this.blockWidth();
      const height = data.h * this.blockHeight();
      this.loadButtonImage();
      this.setColdFrame(x, y, width, height);

      if (data.h === 2) {
         this.setHotFrame(x, y, width, height);
      } else {
         this.setHotFrame(x, y + this.blockHeight(), width, height);
      }

      this.updateFrame();
      this.updateOpacity();
   };

   buttonData() {
      const buttonTable = {

         double: { x: 4, w: 1, y: 0, h: 1 },
         split: { x: 5, w: 1, y: 0, h: 1 },
         down2: { x: 6, w: 1, y: 0, h: 1 },
         hit: { x: 6, w: 1.5, y: 0, h: 1 },
         stand: { x: 7.5, w: 1.5, y: 0, h: 1 },
         placeBet: { x: 9, w: 2, y: 0, h: 1 },
         surrender: { x: 11, w: 1, y: 0, h: 1 },

         spinReels: { x: 6, w: 2, y: 2, h: 1 },
         maxBet: { x: 9.5, w: 1.5, y: 2, h: 1 },
         betOne: { x: 11, w: 1, y: 2, h: 1 },
         dealDraw: { x: 12, w: 2, y: 2, h: 1 },

         shootDice: { x: 12, w: 2, y: 0, h: 2 }
      };
      return buttonTable[this._buttonType];
   }


   enable() {
      this.isVisible = true;
      this.updateOpacity();
   }


   disable() {
      this.isVisible = false;
      this.updateOpacity();
   }

   updateOpacity() {
      if (!this.isVisible || !this.isPayable) {
         this.opacity = 60;
      } else if (this._pressed) {
         this.opacity = 255;
      } else {
         this.opacity = 192;
      }
   }

   updateFrame() {
      let frame = this._coldFrame;

      if (this.isPressed() && this.isVisible && this.isPayable) {
         frame = this._hotFrame;
      }

      if (frame) {
         this.setFrame(frame.x, frame.y, frame.width, frame.height);
      }
   }

   onClick() {
      if (this._clickHandler && this.isVisible && this.isPayable) {
         this._clickHandler();
      } else if (this._clickHandler) {
         Input.virtualClick(this._buttonType);
      }
   }



}
r88.Casino.ToggleButton = class extends r88.Casino.Button {
   isOn = false;
   holdLabel;

   buttonData() {
      const buttonTable = {
         chip0: { x: 0, w: 1, y: 0, h: 1 },
         chip1: { x: 1, w: 1, y: 0, h: 1 },
         chip2: { x: 2, w: 1, y: 0, h: 1 },
         chip3: { x: 3, w: 1, y: 0, h: 1 },

         hold: { x: 8, w: 1.5, y: 2, h: 1 }
      };
      return buttonTable[this._buttonType];
   }

   updateFrame() {
      const frame = this.isOn ? this._coldFrame : this._hotFrame;
      if (frame) {
         this.setFrame(frame.x, frame.y, frame.width, frame.height);
      }
   };

   toggleOn() {
      this.isOn = true;
   }

   toggleOff() {
      this.isOn = false;
   }

   toggle() {
      this.isOn = !this.isOn;
   }

}
r88.Casino.Label = class extends Window_Base {
   #align = 'center';

   constructor(parent, ...args) {
      super(...args);

      this.opacity = 0;
      parent.addWindow(this);
   }

   set fontFace(name) {
      this.contents.fontFace = name;
   }

   set fontSize(size) {
      this.contents.fontSize = size;
   }

   set textColor(color) {
      this.contents.textColor = color;
   }

   set outlineWidth(width) {
      this.contents.outlineWidth = width;
   }

   set align(alignment) {
      this.#align = alignment;
   }

   set text(string) {
      this.contents.clear();
      this.drawText(string, 0, -6, this.innerWidth, this.#align)
   }

}
r88.Casino.Bet = class extends r88.Casino.Button {
   static #defaultStackHeight = 3;
   static #defaultStackCount = 3;
   static #chipScale = 0.5;
   static #buttonTable
   maxStackHeight;
   maxStackCount;
   value = 0;
   #stacks = [];
   #parent;
   #stackX;
   #stackY;
   #winLose = 0;
   #flatAmount;

   constructor(parent, ...args) {
      super(...args);
      this._buttonType = args[0];
      this.chipValues = parent.chipValues;
      this.#parent = parent;
      parent.addWindow(this);

      if ('stx' in this.buttonData()) {
         this.#stackX = this.buttonData().stx;
         this.#stackY = this.buttonData().sty;

      } else {
         this.#stackX = this.x;
         this.#stackY = this.y;
      }
      this.maxStackHeight = r88.Casino.Bet.#defaultStackHeight;
      this.maxStackCount = r88.Casino.Bet.#defaultStackCount;

      this.setClickHandler(this.push.bind(this));

   }

   /**
    * Sets the default bet limit.
    * @param {Number} height Maximum chips per stack.
    * @param {Number} count Maximum number of stacks.
    */
   static setBetLimit(height, count) {
      this.#defaultStackHeight = height;
      this.#defaultStackCount = count;
   }

   static setChipScale(scale) {
      this.#chipScale = scale;
   }

   static createButtonTable() {
      const bw = 48;
      const mbw = bw * 1.5;
      const bh = 48;
      const gw = Graphics.boxWidth;
      const gh = Graphics.boxHeight;
      const placeX = gw / 5.8;
      const placeY = gh / 2 - bh * 2;
      const cOddsX = gw / 6.55;
      const cOddsY = gh / 3.25;
      const dcOddsY = gh / 4;

      const other = {
         bet: { x: 6, w: 4, y: 0, h: 4, stx: gw - bw * 3, sty: gh - bh * 4.5 },
         banker: { x: 0, w: 6, y: 1, h: 1.5, stx: gw - bw * 8, sty: gh - bh * 4.5 },
         player: { x: 0, w: 6, y: 2.5, h: 1.5, stx: gw - bw * 10, sty: gh - bh * 3 },
         tie: { x: 2, w: 2, y: 0, h: 1, stx: gw - bw * 9, sty: gh - bh * 5.5 },
      };
      const craps = {
         dCome: { x: 2, w: 1.5, y: 4, h: 2, stx: placeX, sty: placeY - bh },
         come: { x: 2, w: 9, y: 6, h: 2, stx: gw / 2.5, sty: gh / 2 - bh },
         field: { x: 2, w: 9, y: 8, h: 2, stx: gw / 3, sty: gh / 2 + bh },
         pass: {
            x: 0, w: 11, y: 0, h: 8, stx: gw / 4, sty: gh / 2 + bh * 3.2,
            polygon: [0, bh,
               bw, bh * 0.5,
               bw, 7 * bh,
               10.75 * bw, 7 * bh,
               10.75 * bw, 8 * bh,
               0, 8 * bh
            ],

            fileName: 'Polygon_PassLine'
         },
         dPass: {
            x: 1, w: 10, y: 0, h: 7, stx: gw / 2, sty: gh / 2 + bh * 2.2,
            polygon: [0, bh * 0.5,
               bw, 0,
               bw, 6 * bh,
               9.75 * bw, 6 * bh,
               9.75 * bw, 7 * bh,
               0, 7 * bh
            ],

            fileName: 'Polygon_DontPassLine'
         },

         pOdds: { x: .75, w: .25, y: 0, h: 1, stx: gw / 3.9, sty: gh / 2 + bh * 3.8 },
         dPOdds: { x: .75, w: .25, y: 0, h: 1, stx: gw / 1.975, sty: gh / 2 + bh * 2.8 },

         place4: { x: 3.5, w: 1.5, y: 5.75, h: 0.29, stx: placeX + mbw, sty: placeY },
         place5: { x: 5, w: 1.5, y: 5.75, h: 0.29, stx: placeX + mbw * 2, sty: placeY },
         place6: { x: 6.5, w: 1.5, y: 5.75, h: 0.29, stx: placeX + mbw * 3, sty: placeY },
         place8: { x: 8, w: 1.5, y: 5.75, h: 0.29, stx: placeX + mbw * 4, sty: placeY },
         place9: { x: 9.5, w: 1.5, y: 5.75, h: 0.29, stx: placeX + mbw * 5, sty: placeY },
         place10: { x: 11, w: 1.5, y: 5.75, h: 0.29, stx: placeX + mbw * 6, sty: placeY },

         cOdds4: { x: 3.5, w: 1.5, y: 4.5, h: 1.25, stx: cOddsX + mbw, sty: cOddsY },
         cOdds5: { x: 5, w: 1.5, y: 4.5, h: 1.25, stx: cOddsX + mbw * 2, sty: cOddsY },
         cOdds6: { x: 6.5, w: 1.5, y: 4.5, h: 1.25, stx: cOddsX + mbw * 3, sty: cOddsY },
         cOdds8: { x: 8, w: 1.5, y: 4.5, h: 1.25, stx: cOddsX + mbw * 4, sty: cOddsY },
         cOdds9: { x: 9.5, w: 1.5, y: 4.5, h: 1.25, stx: cOddsX + mbw * 5, sty: cOddsY },
         cOdds10: { x: 11, w: 1.5, y: 4.5, h: 1.25, stx: cOddsX + mbw * 6, sty: cOddsY },

         dCOdds4: { x: 3.5, w: 1.5, y: 4, h: 0.55, stx: cOddsX + mbw, sty: dcOddsY },
         dCOdds5: { x: 5, w: 1.5, y: 4, h: 0.55, stx: cOddsX + mbw * 2, sty: dcOddsY },
         dCOdds6: { x: 6.5, w: 1.5, y: 4, h: 0.55, stx: cOddsX + mbw * 3, sty: dcOddsY },
         dCOdds8: { x: 8, w: 1.5, y: 4, h: 0.55, stx: cOddsX + mbw * 4, sty: dcOddsY },
         dCOdds9: { x: 9.5, w: 1.5, y: 4, h: 0.55, stx: cOddsX + mbw * 5, sty: dcOddsY },
         dCOdds10: { x: 11, w: 1.5, y: 4, h: 0.55, stx: cOddsX + mbw * 6, sty: dcOddsY },
      }

      const roulette = Object.fromEntries(r88.Casino.Bet.createRouletteTable(bw, gw, gh));
      r88.Casino.Bet.#buttonTable = { ...other, ...craps, ...roulette };

   }
   static createRouletteTable(bw, gw, gh) {
      const roulette = new Map([
         ['straight0', { x: 13, y: 1, w: 0.75, h: 3, stx: gw - bw * 16.25, sty: gh / 4 }],
         ['firstFour', { x: 13.75, y: 0.75, w: 0.5, h: 0.5 }],
         ['trio0', { x: 13.75, y: 2.75, w: 0.5, h: 0.5 }],
         ['trio1', { x: 13.75, y: 1.75, w: 0.5, h: 0.5 }],
         ['dozen0', { x: 14, y: 4, w: 4, h: 1 }],
         ['dozen1', { x: 18, y: 4, w: 4, h: 1 }],
         ['dozen2', { x: 22, y: 4, w: 4, h: 1 }],
         ['low', { x: 14, y: 5, w: 2, h: 1 }],
         ['even', { x: 16, y: 5, w: 2, h: 1 }],
         ['red', { x: 18, y: 5, w: 2, h: 1 }],
         ['black', { x: 20, y: 5, w: 2, h: 1 }],
         ['odd', { x: 22, y: 5, w: 2, h: 1 }],
         ['high', { x: 24, y: 5, w: 2, h: 1 }]
      ]);

      //Straight and street bets
      for (let i = 0, k = 1; i < 12; i++, k += 3) {
         for (let j = 0; j < 3; j++) {
            roulette.set('straight' + (k + j), {
               x: 14.25 + i, y: 3.25 - j, w: (i === 11) ? 0.75 : 0.5, h: (j === 0) ? 0.75 : 0.5
            });
         }

         roulette.set('street' + i, {
            x: 14.25 + i, y: 0.75, w: (i === 11) ? 0.75 : 0.5, h: 0.5
         });
      }

      //Corner and six bets
      for (let i = 0, k = 0; i < 11; i++) {
         for (let j = 0; j < 2; j++, k++) {
            roulette.set('corner' + k, {
               x: 14.75 + i, y: 2.75 - j, w: 0.5, h: 0.5
            });
         }

         roulette.set('six' + i, {
            x: 14.75 + i, y: 0.75, w: 0.5, h: 0.5,
         });
      }

      //Split bets
      for (let i = 0; i < 3; i++) {
         roulette.set('split' + i, {
            x: 13.75, y: 3.25 - i, w: 0.5, h: (i === 0) ? 0.75 : 0.5,
         });
      }
      for (let i = 0, k = 3; i < 12; i++) {
         for (let j = 0; j < 2; j++, k++) {
            roulette.set('split' + k, {
               x: 14.25 + i, y: 2.75 - j, w: (i === 11) ? 0.75 : 0.5, h: 0.5
            });
         }
      }
      for (let i = 0, k = 27; i < 11; i++) {
         for (let j = 0; j < 3; j++, k++) {
            roulette.set('split' + k, {
               x: 14.75 + i, y: 3.25 - j, w: 0.5, h: (j === 0) ? 0.75 : 0.5
            });
         }
      }

      //Column bets
      for (let j = 0; j < 3; j++) {
         roulette.set('column' + j, {
            x: 26, y: 3 - j, w: 0.5, h: 1,
         });
      }

      return roulette;
   }

   /**
    * Sets click handler to "pushFlatAmount".
    * @param {Number} value Value of chips that will be added.
    */
   setFlatAmount(value) {
      this.setClickHandler(this.pushFlatAmount.bind(this, value));
      this.#flatAmount = value;
   }

   /**
    * Get the flat chip value that was last added.
    * @returns this.#flatAmount
    */
   getFlatAmount() {
      return this.#flatAmount;
   }

   update() {
      super.update();

      if (this.chipValues[this.#parent.chipIndex] > this.#parent.bank) {
         this.isPayable = false;
      } else {
         this.isPayable = true;
      }

      if (this.#winLose === -1) {
         if (this.#stacks[0][0].y > 0) {
            for (const stack of this.#stacks) {
               for (const chip of stack) {
                  chip.y -= 35 * Graphics.app.ticker.deltaTime;
                  chip.x += ((Graphics.boxWidth / 2 - this.#stackX) / this.#stackY) * 35 * Graphics.app.ticker.deltaTime;
               }
            }
         } else {

            this.reset();
         }
      }

      if (this.#winLose === 1) {
         if (this.#stacks[0][0].y < Graphics.boxHeight) {
            for (const stack of this.#stacks) {
               for (const chip of stack) {
                  chip.y += 35 * Graphics.app.ticker.deltaTime;
                  chip.x += ((Graphics.boxWidth / 2 - this.#stackX) / (Graphics.boxHeight - this.#stackY)) * 35 * Graphics.app.ticker.deltaTime;
               }
            }
         } else {
            this.reset();
         }
      }

   }

   setupFrames() {
      this.loadButtonImage();
      const data = this.buttonData();
      const x = data.x * this.blockWidth();
      const y = data.y * this.blockHeight();
      const width = data.w * this.blockWidth();
      const height = data.h * this.blockHeight();
      this.setColdFrame(x, y, width, height);
      this.setHotFrame(x, y, width, height);

      this.updateFrame();
      this.updateOpacity();
   };

   hitTest(x, y) {

      if (this.isPolygon()) {
         const poly = new PIXI.Polygon(this.buttonData()['polygon']);
         return poly.contains(x, y);
      } else {
         const rect = new Rectangle(
            -this.anchor.x * this.width,
            -this.anchor.y * this.height,
            this.width,
            this.height
         );
         return rect.contains(x, y);
      }

   };

   loadButtonImage() {
      if (this.isPolygon()) {
         this.bitmap = ImageManager.loadPicture('r88_Casino_pictures/' + this.buttonData().fileName);
      } else {
         this.bitmap = ImageManager.loadPicture("r88_Casino_pictures/CGBetSet");
      }
   };

   isPolygon() {
      return ('polygon' in this.buttonData());
   }

   buttonData() {
      return r88.Casino.Bet.#buttonTable[this._buttonType];
   }

   addChip(chipDenom) {
      this.#parent.bank -= this.chipValues[chipDenom];
      this.#parent.updateBankWindow();

      let lastStack = this.#stacks[this.#stacks.length - 1];
      if (this.#stacks.length < 1 || lastStack.length >= this.maxStackHeight) {
         const newStack = [];
         this.#stacks.push(newStack);
         lastStack = newStack;
      }

      const sprite = new Sprite();
      sprite.bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/chips/', 'chipStack' + chipDenom);
      sprite.anchor.set(0.5, 0.5);
      sprite.scale.x = r88.Casino.Bet.#chipScale;
      sprite.scale.y = r88.Casino.Bet.#chipScale;

      if ('stx' in this.buttonData()) {
         this.#stackX = this.buttonData().stx;
         this.#stackY = this.buttonData().sty;
      } else {
         this.#stackX = this.x - 18;
         this.#stackY = this.y + 16;
      }

      let startX = this.#stackX + 35 * this.#stacks.length;
      let startY = this.#stackY - 3.5 * lastStack.length;

      if (this.#stacks.length > 2) {
         startX = this.#stackX + 35 * (this.#stacks.length - 1.5);
         startY = (this.#stackY + 20) - 3.5 * lastStack.length;
      }
      sprite.x = startX;
      sprite.y = startY;

      lastStack.push(sprite);
      this.#parent.addChild(sprite);
      sprite.zIndex = 1;

      if (this.#parent.bank < this.chipValues[chipDenom]) {
         this.disable();
      }

      if (this.#stacks.length >= this.maxStackCount && lastStack.length >= this.maxStackHeight) {
         this.disable();
      }
      this.value += this.chipValues[chipDenom];

   }

   push() {
      const chipDenom = this.#parent.chipIndex;
      const soundNumber = Math.floor(Math.random() * 2);
      const soundVolume = Math.floor(Math.random() * 20);


      this.#parent.buttons.get('placeBet').enable();
      this.#parent.playSound({ name: 'chip_add' + soundNumber, volume: 80 - soundVolume, pitch: 100 });

      this.addChip(chipDenom);
   }

   pushFlatAmount(amount) {
      const chipValues = JSON.parse(r88.Casino.parameters['Chip Values']);
      let cumAmount = amount;

      for (let i = this.maxStackHeight; i > 0; i--) {
         while (chipValues[i] <= cumAmount) {

            if (chipValues[i] <= this.#parent.bank) this.addChip(i)
            cumAmount -= chipValues[i];
         }
      }

      this.disable();
   }

   /**
    * Moves this bet's stacks to a different bet.
    * @param {string} destination The name of the bet that will serve as the new location.
    */
   moveTo(destination) {

      for (const stack of this.#stacks) {
         for (const chip of stack) {
            const chipName = chip.bitmap._url;
            const chipIndex = chipName.slice(-5, -4);
            destination.addChip(chipIndex);
         }
      }
   }

   winChips() {

      if (this.value !== 0) {
         this.#parent.playSound({ name: 'pushChips', volume: 50, pitch: 100 });
         this.#winLose = 1;
      }
   }

   loseChips() {
      if (this.value !== 0) {
         this.#parent.playSound({ name: 'pullChips', volume: 100, pitch: 100 });
         this.#winLose = -1;
      }
   }

   reset() {
      this.#winLose = 0;
      for (const stack of this.#stacks) {
         for (const chip of stack) {
            chip.destroy();
         }
      }

      this.#stacks = [];
      this.value = 0;
   }

}

//-----------------------------------------------------------------------------
// Abstract Game Classes
//
// Base classes for all games.

r88.Casino.Game = class extends Scene_MenuBase {
   chipValues = JSON.parse(r88.Casino.parameters['Chip Values']);

   buttons = new Map();
   bets = new Map();

   bank = (r88.Casino.parameters['Use Variable as Currency'] !== '0') ? $gameVariables.value(r88.Casino.parameters['Use Variable as Currency']) :
      $gameParty.gold();
   bet = 0;
   isBetting = true;
   #defaultKeyMapper = Object.assign({}, Input.keyMapper);
   chipIndex = 0;

   create() {
      r88.Casino.Bet.createButtonTable();
      this.createBackground();
      this.updateActor();
      this.#createTable();
      this.createWindowLayer();
      r88.Casino.Bet.setChipScale(0.5);

      Input.keyMapper[32] = 'space';
      for (let i = 0; i < 4; i++) {
         Input.keyMapper[49 + i] = 'chip' + i;
      }
   };

   #createTable() {
      const table = new Sprite();
      const bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/backgrounds/', 'table_green');
      table.bitmap = bitmap;
      table.x = 0;
      table.y = 0;
      this.addChild(table);
      this.table = table;
   };

   update() {
      super.update();

      if (Input.isTriggered('cancel')) {
         this.#onSceneCancel();
      }

      if (this.buttons.has('chip0')) {
         for (let i = 0; i < 4; i++) {
            if (Input.isTriggered('chip' + i) && this.buttons.get('chip' + i).isVisible && this.chipIndex !== i) {
               this.#selectChip(i);
            }
         }

      }

   }
   /**
    * @param {string} fileName Name of background file.
    */
   setTable(fileName) {
      if (fileName === 'none') {
         this.table.destroy();

      } else {
         this.table.bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/backgrounds/', fileName);;
      }
   }

   createButtons() {
      const cancelButton = new Sprite_Button("cancel");
      this.addWindow(cancelButton);
      cancelButton.setClickHandler(this.#onSceneCancel.bind(this));
      cancelButton.x = Graphics.boxWidth - 100;
      cancelButton.y = this.buttonY();
   }

   createChips() {
      const bh = 48
      const bw = 48;
      const chipConfigs = [
         { name: "chip0", x: Graphics.boxWidth - bw * 4, y: Graphics.boxHeight - bh * 2 },
         { name: "chip1", x: Graphics.boxWidth - bw * 3, y: Graphics.boxHeight - bh * 2 },
         { name: "chip2", x: Graphics.boxWidth - bw * 2, y: Graphics.boxHeight - bh * 2 },
         { name: "chip3", x: Graphics.boxWidth - bw, y: Graphics.boxHeight - bh * 2 }
      ]

      chipConfigs.forEach(config => {
         const chip = new r88.Casino.ToggleButton(config.name);
         const index = Number(config.name.slice(-1));
         this.addWindow(chip);
         chip.setClickHandler(this.#selectChip.bind(this, index));
         chip.x = config.x;
         chip.y = config.y;
         this.buttons.set(config.name, chip);
      });

      this.buttons.get('chip0').toggle();
   }

   #selectChip(index) {
      this.playSound({ name: 'chip_add0', volume: 80, pitch: 75 });
      this.chipIndex = index;
      this.buttons.get('chip0').toggleOff();
      this.buttons.get('chip1').toggleOff();
      this.buttons.get('chip2').toggleOff();
      this.buttons.get('chip3').toggleOff();
      this.buttons.get('chip' + index).toggleOn();

   }

   /**
    * @param {Array.<{name: String, x: Number, y: Number}>} configs Name and position of each bet.
    */
   assignBetButtons(configs) {
      configs.forEach(config => {
         const button = new r88.Casino.Bet(this, config.name);
         this.addWindow(button);
         button.x = config.x;
         button.y = config.y;
         button.enable();
         this.bets.set(config.name, button);
      });
   }

   /**
    * @param {Array.<{name: string, x: number, y: number}>} configs Name and position of each button.
    */
   assignButtons(configs) {
      configs.forEach(config => {
         const button = new r88.Casino.Button(config.name);
         this.addWindow(button);
         button.setClickHandler(this[config.name].bind(this));
         button.x = config.x;
         button.y = config.y;
         button.disable();
         this.buttons.set(config.name, button);
      });
   }

   updateBankWindow() {
      let text;
      if (r88.Casino.parameters['Currency Position'] === 'Before') {
         text = r88.Casino.parameters['Currency Unit'] + this.bank;
      } else {
         text = '' + this.bank + '' + r88.Casino.parameters['Currency Unit'];
      }

      this.bankWindow.text = text;
   };

   createBankWindow(x, y) {
      const ww = 200;
      const wh = this.helpAreaHeight() / 2;
      const wx = (x) ? x : Graphics.boxWidth - ww - 96;
      const wy = (y) ? y : this.helpAreaTop() + wh;
      this.bankWindow = new r88.Casino.Label(this, new Rectangle(wx, wy, ww, wh));
      this.bankWindow.align = 'right';
      this.updateBankWindow();
   };

   /**
    * @param {Object} soundStr Contains sound effect parameters.
    * @param {string} soundStr.name
    * @param {number} soundStr.volume
    * @param {number} soundStr.pitch
    */
   playSound(soundStr) {
      const name = 'r88_Casino_se/' + soundStr['name'];
      AudioManager.playSe(
         {
            name: name,
            volume: soundStr['volume'],
            pitch: soundStr['pitch']
         });
   };

   #onSceneCancel() {
      SceneManager.pop();
      Input.keyMapper = this.#defaultKeyMapper;

      if (r88.Casino.parameters['Use Variable as Currency'] !== '0') {
         $gameVariables.setValue(r88.Casino.parameters['Use Variable as Currency'], this.bank);
      } else {
         const difference = this.bank - $gameParty.gold();
         $gameParty.gainGold(difference);

      }
   }
}
r88.Casino.CardGame = class extends r88.Casino.Game {
   cardSprites = [];
   #cards =
      [
         '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'tC', 'jC', 'qC', 'kC', 'aC',
         '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'tS', 'jS', 'qS', 'kS', 'aS',
         '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'tD', 'jD', 'qD', 'kD', 'aD',
         '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'tH', 'jH', 'qH', 'kH', 'aH',
      ];
   cardWidth = 140;
   cardHeight = 190;
   penetration = 0.25;

   constructor(...args) {
      super(...args);
      this.refreshDeck();
      this.sortableChildren = true;
      this.preLoadCards();
   }

   preLoadCards() {
      for (const card of this.#cards) {
         ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/cards/', card);
      }
   }

   /**
    * @param {string} card The rank and suit of the card (e.g. "2C", "tH").
    * @param {number} x X position of the card.
    * @param {number} y Y position of the card.
    * @param {boolean} isHidden Card is showing back.
    * @param {number} scale Scale of the card.
    * @param {number} angle Rotation of the card.
    * @param {number} opacity Opacity of the card.
    */
   drawCard(card, x, y, isHidden, scale, angle, opacity) {
      let cardSprite = new Sprite();
      if (isHidden) card = 'cardBack';
      const bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/cards/', card);
      cardSprite.bitmap = bitmap;
      cardSprite.anchor.set(0.5, 0.5);
      cardSprite.x = x;
      cardSprite.y = y;
      cardSprite.opacity = opacity;
      cardSprite.angle = angle;
      cardSprite.scale.x = scale;
      cardSprite.scale.y = scale;
      this.addChild(cardSprite);
      this.cardSprites.push(cardSprite);
   };

   /**
    * 
    * @param {Array} decks The array representation of a stack of cards.
    */
   shuffle(decks) {
      let currentIndex = decks.length;
      while (currentIndex != 0) {
         let randomIndex = Math.floor(Math.random() * currentIndex);
         currentIndex--;
         [decks[currentIndex], decks[randomIndex]] = [
            decks[randomIndex], decks[currentIndex]];
      }
   };

   refreshDeck(deckCount) {
      this.deck = []
      for (let i = 0; i < deckCount; i++) {
         this.deck.push(...this.#cards);
      }
      this.shuffle(this.deck);
   }

}

//-----------------------------------------------------------------------------
// Game Classes
//
// Classes for the games.

r88.Casino.Baccarat = class extends r88.Casino.CardGame {
   #cardValues =
      {
         '2C': 2, '3C': 3, '4C': 4, '5C': 5, '6C': 6, '7C': 7, '8C': 8, '9C': 9, 'tC': 0, 'jC': 0, 'qC': 0, 'kC': 0, 'aC': 1,
         '2S': 2, '3S': 3, '4S': 4, '5S': 5, '6S': 6, '7S': 7, '8S': 8, '9S': 9, 'tS': 0, 'jS': 0, 'qS': 0, 'kS': 0, 'aS': 1,
         '2D': 2, '3D': 3, '4D': 4, '5D': 5, '6D': 6, '7D': 7, '8D': 8, '9D': 9, 'tD': 0, 'jD': 0, 'qD': 0, 'kD': 0, 'aD': 1,
         '2H': 2, '3H': 3, '4H': 4, '5H': 5, '6H': 6, '7H': 7, '8H': 8, '9H': 9, 'tH': 0, 'jH': 0, 'qH': 0, 'kH': 0, 'aH': 1,
      };

   #playerHand = [];
   #bankerHand = [];
   #playerValue = 0;
   #bankerValue = 0;
   #maxRevealTimer = 60;
   #revealTimer = 0;
   #isRevealed = false;
   #displayWindow;


   create() {
      super.create();
      this.refreshDeck(6);
      r88.Casino.Bet.setBetLimit(3, 3);
      this.setTable('table_red');
      this.createBankWindow();
      this.#createDisplayWindow();
      this.createButtons();
      this.createChips();
      this.#createLabels();

   };

   update() {
      super.update();

      if (this.#revealTimer > 0) {
         this.#revealTimer -= Graphics.app.ticker.deltaTime;

         if (this.#isRevealed && this.#revealTimer <= this.#maxRevealTimer / 9) {
            this.#revealTimer = 0;

            this.#drawThirdCard();
            this.#newBet();
            return;
         }

         if (this.#revealTimer <= this.#maxRevealTimer / 10) {
            this.#isRevealed = true;
            this.#revealTimer = this.#maxRevealTimer;
            this.#updateImages();
         }
      }


      if (Input.isTriggered('ok') || Input.isTriggered('space')) {
         if (this.buttons.get('placeBet').isVisible) this.placeBet();
      }
   }

   createButtons() {
      super.createButtons();
      const bh = 48;
      const bw = 48;

      const buttonConfigs = [

         { name: "placeBet", x: Graphics.boxWidth - bw * 2, y: Graphics.boxHeight - bh },
      ];

      this.assignButtons(buttonConfigs);


      const betConfigs = [
         { name: "player", x: Graphics.boxWidth / 2 - bw * 3, y: Graphics.boxHeight - bh * 3.5 },
         { name: "banker", x: Graphics.boxWidth / 2 - bw * 3, y: Graphics.boxHeight - bh * 5 },
         { name: "tie", x: Graphics.boxWidth / 2 - bw, y: Graphics.boxHeight - bh * 6 },
      ]

      this.assignBetButtons(betConfigs);

   }

   #createDisplayWindow() {
      const face = 'Brush Script MT';
      const size = 30;
      let ww = 300;
      let wh = 55;
      let wx = 0;
      let wy = Graphics.boxHeight - this.helpAreaHeight() / 2;
      this.#displayWindow = new r88.Casino.Label(this, new Rectangle(wx, wy, ww, wh));
      this.#displayWindow.fontFace = face;
      this.#displayWindow.fontSize = size;
      this.#displayWindow.text = 'Welcome to Baccarat';
   }

   #createLabels() {
      const ch = this.cardHeight * 0.75;
      const face = 'Georgia';
      const size = 30;
      const ww = 200;
      const wh = this.helpAreaHeight();

      const ly = this.buttonAreaBottom() + 48;

      let px = Graphics.boxWidth / 3.25 - ww / 2;
      let label = new r88.Casino.Label(this, new Rectangle(px, ly, ww, wh));
      label.fontFace = face;
      label.fontSize = size;
      label.text = 'PLAYER';

      let bx = Graphics.boxWidth / 1.45 - ww / 2;
      label = new r88.Casino.Label(this, new Rectangle(bx, ly, ww, wh));
      label.fontFace = face;
      label.fontSize = size;
      label.text = 'BANKER';

      const iy = Graphics.boxHeight / 2 - ch;

      px = Graphics.boxWidth / 3.25 - 60;
      let image = new Sprite();
      image.bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/', 'baccarat_player');
      image.y = iy;
      image.x = px;
      this.addChild(image);

      bx = Graphics.boxWidth / 1.45 - 60;
      image = new Sprite();
      image.bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/', 'baccarat_banker');
      image.y = iy;
      image.x = bx;
      this.addChild(image);
   }


   #newBet() {

      this.playSound({ name: 'chip_take', volume: 80, pitch: 100 });
      this.isBetting = true;
      this.updateBankWindow();
      this.#bankerHand = [];
      this.#playerHand = [];
      this.#isRevealed = false;

      if (this.deck.length < this.penetration * this.deck.length) this.refreshDeck(6);

      for (let i = 0; i < 4; i++) {
         this.buttons.get('chip' + i).enable();
      }

      this.bets.get('player').enable();
      this.bets.get('banker').enable();
      this.bets.get('tie').enable();


   }

   #updateImages() {
      for (const cardSprite of this.cardSprites) {
         cardSprite.destroy();
      }
      this.cardSprites = [];

      const scale = 0.75
      const ch = this.cardHeight * scale;
      const cw = this.cardWidth * scale;
      const y = Graphics.boxHeight / 2 - ch / 2;


      for (let i = 0; i < this.#bankerHand.length; i++) {
         let angle = 0;
         let cardInterval = cw * i;

         if (i === 2) {
            cardInterval = cw + ch;
            angle = 90;
         }

         const startX = (Graphics.boxWidth / 2) + cw * 0.8;
         const x = startX + cardInterval;


         this.drawCard(this.#bankerHand[i], x, y, !this.#isRevealed, scale, angle, 255);
      }


      for (let i = 0; i < this.#playerHand.length; i++) {
         let angle = 0;

         let cardInterval = cw * i;

         if (i === 2) {
            cardInterval = -ch;
            angle = -90;
         }

         let startX = (Graphics.boxWidth / 2) - cw * 1.7;
         let x = startX + cardInterval;

         this.drawCard(this.#playerHand[i], x, y, !this.#isRevealed, scale, angle, 255);
      }
   }

   placeBet() {
      this.#updateImages();
      this.buttons.get('placeBet').disable();
      for (let i = 0; i < 4; i++) {
         this.buttons.get('chip' + i).disable();
      }

      this.isBetting = false;
      this.deal();
   }

   deal() {
      this.bets.get('player').disable();
      this.bets.get('banker').disable();
      this.bets.get('tie').disable();

      this.#playerHand = [this.deck.pop(), this.deck.pop()];
      this.#bankerHand = [this.deck.pop(), this.deck.pop()];
      this.#updateImages();
      this.#revealTimer = this.#maxRevealTimer;
   }

   #drawThirdCard() {
      const natural = (this.#playerValue >= 8 || this.#bankerHand >= 8);
      let thirdCard = '';
      let thirdCardValue = 0;

      if (!natural) {
         this.#updateHandValues();
         if (this.#playerValue <= 5) {
            this.playSound({ name: 'card_hit', volume: 60, pitch: 100 });
            thirdCard = this.deck.pop();
            this.#playerHand.push(thirdCard);
            thirdCardValue = this.#cardValues[thirdCard];
         }

         let isBankerThird = false;

         if (this.#bankerValue === 3 && thirdCardValue !== 8) {
            isBankerThird = true;
         } else if (this.#bankerValue === 4 && thirdCardValue >= 2 && thirdCardValue <= 7) {
            isBankerThird = true;
         } else if (this.#bankerValue === 5 && thirdCardValue >= 4 && thirdCardValue <= 7) {
            isBankerThird = true;
         } else if (this.#bankerValue === 6 && (thirdCardValue === 6 || thirdCardValue === 7)) {
            isBankerThird = true;
         } else if (this.#bankerValue !== 7) {
            isBankerThird = true;
         }

         if (isBankerThird) {
            this.#bankerHand.push(this.deck.pop());
            this.playSound({ name: 'card_hit', volume: 60, pitch: 100 });
         }

      }

      this.#updateImages();
      this.#updateHandValues();
      this.#scoring();
   }

   #scoring() {
      if (this.#playerValue > this.#bankerValue) {
         this.#displayWindow.text = 'Player wins';
         this.bank += this.bets.get('player').value * 2;
         this.bets.get('player').winChips();

      } else {
         this.bets.get('player').loseChips();
      }

      if (this.#bankerValue > this.#playerValue) {
         this.#displayWindow.text = 'Banker wins';

         this.bank += (this.#bankerValue === 6) ?
            Math.floor(this.bets.get('banker').value * 1.5) : this.bets.get('banker').value * 2;
         this.bets.get('banker').winChips();

      } else {
         this.bets.get('banker').loseChips();
      }

      if (this.#bankerValue === this.#playerValue) {
         this.#displayWindow.text = 'Tie bets win';
         this.bank += this.bets.get('tie').value * 9;
         this.bets.get('tie').winChips();
      } else {
         this.bets.get('tie').loseChips();
      }

   }

   #calcHandValue(hand) {
      let value = 0;
      for (let card of hand) {
         value += this.#cardValues[card];
      }

      while (value > 10) {
         value -= 10;
      }
      return value;
   }

   #updateHandValues() {
      this.#playerValue = this.#calcHandValue(this.#playerHand);
      this.#bankerValue = this.#calcHandValue(this.#bankerHand);
   }


}
r88.Casino.Blackjack = class extends r88.Casino.CardGame {
   PlayerHand = class {
      value = 0;
      isDoubled = false;

      constructor(cards) {
         this.cards = cards;
      }

      get length() {
         return this.cards.length;
      }

      hasPair() {
         return this.cards[0].charAt(0) === this.cards[1].charAt(0);
      }

      isBlackjack() {
         return this.cards.length === 2 && this.value === 21;
      }

   }

   #resetTimer = 0;
   #maxResetTimer = 100;

   #handIndex = 0;
   #isRevealed = false;
   #playerHands = [];
   #dealerHand = [];
   #dealerValue = 0;
   #currentHand = [];
   #messageWindow;
   #scoreTimer = 0;
   #maxScoreTimer = 50;

   create() {
      super.create();
      this.setTable('table_green');
      this.refreshDeck(6);
      r88.Casino.Bet.setBetLimit(5, 2);
      this.createBankWindow();
      this.#createMessageWindow();
      this.#messageWindow.text = 'Place Bet';
      this.createButtons();
      this.createChips();
   };

   #createMessageWindow() {
      const face = 'Brush Script MT';
      const size = 30;
      let ww = 200;
      let wh = 55;
      let wx = 0;
      let wy = Graphics.boxHeight - this.helpAreaHeight() / 2;
      this.#messageWindow = new r88.Casino.Label(this, new Rectangle(wx, wy, ww, wh));
      this.#messageWindow.fontFace = face;
      this.#messageWindow.fontSize = size;
   }

   createButtons() {
      super.createButtons();
      const bh = 48
      const bw = 48;
      const buttonConfigs = [
         { name: "hit", x: Graphics.boxWidth / 2 - bw * 1.5, y: Graphics.boxHeight - bh },
         { name: "stand", x: Graphics.boxWidth / 2, y: Graphics.boxHeight - bh },
         { name: "double", x: Graphics.boxWidth / 4, y: Graphics.boxHeight - bh },
         { name: "split", x: Graphics.boxWidth / 4, y: Graphics.boxHeight - bh * 2 },
         { name: "placeBet", x: Graphics.boxWidth - bw * 2, y: Graphics.boxHeight - bh },
         { name: "surrender", x: Graphics.boxWidth / 2 + bw * 1.5, y: Graphics.boxHeight - bh }
      ];

      this.assignButtons(buttonConfigs);

      const betConfigs = [
         { name: "bet", x: Graphics.boxWidth - bw * 4, y: Graphics.boxHeight - bh * 6.5 },
      ]

      this.assignBetButtons(betConfigs);
   };

   update() {
      super.update();

      if (this.#resetTimer > 0) {
         this.#resetTimer -= Graphics.app.ticker.deltaTime;

         if (this.#resetTimer <= this.#maxResetTimer / 10) {
            this.#resetTimer = 0;
            this.#newBet();
         }
      }

      if (this.#scoreTimer > 0) {
         this.#scoreTimer -= Graphics.app.ticker.deltaTime;

         const isLast = (this.#handIndex >= this.#playerHands.length - 1);

         if (this.#scoreTimer <= this.#maxScoreTimer * 0.9 && !isLast) {
            this.#handIndex++;
            this.#currentHand = this.#playerHands[this.#handIndex];
            this.#scoreTimer = 0;
            this.deal();
            return;
         }

         if (this.#scoreTimer <= this.#maxScoreTimer / 10) {
            for (const hand of this.#playerHands) {
               this.scoring(hand);
            }

            this.#scoreTimer = 0;
            this.#resetTimer = this.#maxResetTimer;
         }

      }

      if (Input.isTriggered('ok') || Input.isTriggered('space')) {
         if (this.buttons.get('placeBet').isVisible) this.placeBet();
      }
   };


   #newBet() {
      this.playSound({ name: 'card_shuffle', volume: 60, pitch: 100 });
      this.#dealerHand = [];
      this.#playerHands = [];
      this.#updateImages();
      this.isBetting = true;
      this.updateBankWindow();

      this.#messageWindow.text = 'Place Bet';

      for (let i = 0; i < 4; i++) {
         this.buttons.get('chip' + i).enable();
      }

      this.bets.get('bet').enable();

   }

   placeBet() {
      this.buttons.get('placeBet').disable();
      this.bets.get('bet').disable();

      for (let i = 0; i < 4; i++) {
         this.buttons.get('chip' + i).disable();
      }

      this.isBetting = false;
      this.#newRound();
   }

   #newRound() {
      this.#isRevealed = false;
      this.#handIndex = 0;

      this.#currentHand = new this.PlayerHand(([]));
      this.#playerHands.push(this.#currentHand);
      if (this.deck.length < this.penetration * this.deck.length) this.refreshDeck(6);
      this.deal();
   }


   #updateImages() {
      for (const cardSprite of this.cardSprites) {
         cardSprite.destroy();
      }
      this.cardSprites = [];

      const dealerY = this.cardHeight / 2 * .75 + 48;
      for (let i = 0; i < this.#dealerHand.length; i++) {
         let isHidden = (i === 1 && !this.#isRevealed) ? true : false;
         let dealerX = Graphics.boxWidth / 5 + 50 * i;
         this.drawCard(this.#dealerHand[i], dealerX, dealerY, isHidden, .75, 0, 255);
      }

      const scale = -0.1 * this.#playerHands.length + 0.85;
      const ch = this.cardHeight * scale;
      const cw = this.cardWidth * scale;
      const startY = Graphics.boxHeight - ch / 2 - 48;

      for (let i = 0; i < this.#playerHands.length; i++) {
         const thisHand = this.#playerHands[i].cards;

         for (let j = 0; j < thisHand.length; j++) {
            const cardInterval = cw / 4 * j;
            const handInterval = cw * i * 1.25
            const startX = (Graphics.boxWidth / 2) - (cw / 1.75 * (this.#playerHands.length - 1));
            const playerX = startX + cardInterval + handInterval;
            const playerY = startY - ch / 3 * j;
            const opacity = (i === this.#handIndex || this.#isRevealed) ? 255 : 25;

            this.drawCard(thisHand[j], playerX, playerY, false, scale, 0, opacity);
         }
      }

   };

   deal() {
      while (this.#dealerHand.length < 2) {
         this.#dealerHand.push(this.deck.pop())
      }

      for (const hand of this.#playerHands) {
         while (hand.length < 2) {
            hand.cards.push(this.deck.pop());
         }
      }

      this.#updateImages();
      this.#updateHandValues();

      if (this.#dealerValue === 21) {
         this.dealerBlackjack();
         return;
      }

      this.#messageWindow.text = 'You have ' + this.#currentHand.value;

      if (this.bets.get('bet').value <= this.bank) {
         this.buttons.get('double').enable();

         if (this.#currentHand.hasPair() && this.#playerHands.length < 4) {
            this.buttons.get('split').enable();
         }
      }

      if (this.#currentHand.value === 21) {
         this.stand();
      } else {
         this.buttons.get('hit').enable();
         this.buttons.get('stand').enable();
         if (this.#playerHands.length <= 1) this.buttons.get('surrender').enable();
      }



   }

   dealerBlackjack() {
      this.#isRevealed = true;
      this.buttons.get('hit').disable();
      this.buttons.get('stand').disable();
      this.buttons.get('double').disable();
      this.buttons.get('split').disable();
      this.#updateImages();

      this.#scoreTimer = this.#maxScoreTimer;
   }

   split() {
      this.bets.get('bet').pushFlatAmount(this.bets.get('bet').value);
      this.buttons.get('split').disable();
      this.buttons.get('surrender').disable();
      this.updateBankWindow();
      const splitHand = new this.PlayerHand([this.#currentHand.cards.pop()]);
      this.#playerHands.push(splitHand);
      this.deal();
   };

   double() {
      this.bets.get('bet').pushFlatAmount(this.bets.get('bet').value);

      this.updateBankWindow();
      this.#currentHand.isDoubled = true;
      this.hit();
   };

   surrender() {
      this.#isRevealed = true;
      this.buttons.get('hit').disable();
      this.buttons.get('stand').disable();
      this.buttons.get('double').disable();
      this.buttons.get('split').disable();
      this.buttons.get('surrender').disable();
      this.#updateImages();
      this.bank += Math.ceil(this.bets.get('bet').value / 2);
      this.updateBankWindow();
      this.#scoreTimer = this.#maxScoreTimer;
   }

   hit() {
      this.playSound({ name: 'card_hit', volume: 60, pitch: 100 });
      this.buttons.get('double').disable();
      this.buttons.get('split').disable();
      this.buttons.get('surrender').disable();
      this.#currentHand.cards.push(this.deck.pop())
      this.#updateImages();
      this.#updateHandValues();
      this.#messageWindow.text = 'You have ' + this.#currentHand.value;

      if (this.#currentHand.value > 21) {
         this.bust();
      } else if (this.#currentHand.value === 21 || this.#currentHand.isDoubled) {
         this.stand();
      }
   };

   bust() {
      this.#messageWindow.text = 'Bust';
      this.buttons.get('hit').disable();
      this.buttons.get('stand').disable();

      if (this.#handIndex >= this.#playerHands.length - 1) {
         this.#isRevealed = true;
         this.#updateImages();
      }

      this.#scoreTimer = this.#maxScoreTimer;

   };

   scoring(playerHand) {

      if (this.#dealerHand === 21 && this.#dealerHand.length <= 2 && playerHand.value !== 21) {
         this.#messageWindow.text = 'Dealer Blackjack';
         this.bets.get('bet').loseChips();

      } else if (playerHand.value > 21) {
         this.#messageWindow.text = 'Player Busts';
         this.bets.get('bet').loseChips();

      } else if (playerHand.isBlackjack() && this.#playerHands.length <= 1) {
         this.#messageWindow.text = 'Blackjack!';
         this.bank += Math.floor(this.bets.get('bet').value * 2.5);
         this.bets.get('bet').winChips();

      } else if (this.#dealerValue > 21 || playerHand.value > this.#dealerValue) {
         this.#messageWindow.text = 'Player Wins';
         this.bank += this.bets.get('bet').value * 2;
         this.bets.get('bet').winChips();

      } else if (this.#dealerValue === playerHand.value) {
         this.#messageWindow.text = 'Push';
         this.bank += this.bets.get('bet').value;
         this.bets.get('bet').winChips();

      } else {
         this.#messageWindow.text = 'Dealer Wins';
         this.bets.get('bet').loseChips();

      }
   };

   stand() {
      this.buttons.get('hit').disable();
      this.buttons.get('stand').disable();
      this.buttons.get('double').disable();
      this.buttons.get('split').disable();
      this.buttons.get('surrender').disable();

      if (this.#handIndex < this.#playerHands.length - 1) {
         this.#scoreTimer = this.#maxScoreTimer;
         return;
      }

      this.#isRevealed = true;
      this.#updateImages();

      while (this.#dealerValue < 17 && !this.#currentHand.isBlackjack()) {
         this.#dealerHand.push(this.deck.pop());
         this.#updateImages();
         this.#updateHandValues();
      }


      this.#scoreTimer = this.#maxScoreTimer;
   };

   #calcHandValue(hand) {
      let value = 0;
      const cardValues =
      {
         '2C': 2, '3C': 3, '4C': 4, '5C': 5, '6C': 6, '7C': 7, '8C': 8, '9C': 9,
         'tC': 10, 'jC': 10, 'qC': 10, 'kC': 10, 'aC': 11,

         '2S': 2, '3S': 3, '4S': 4, '5S': 5, '6S': 6, '7S': 7, '8S': 8, '9S': 9,
         'tS': 10, 'jS': 10, 'qS': 10, 'kS': 10, 'aS': 11,

         '2D': 2, '3D': 3, '4D': 4, '5D': 5, '6D': 6, '7D': 7, '8D': 8, '9D': 9,
         'tD': 10, 'jD': 10, 'qD': 10, 'kD': 10, 'aD': 11,

         '2H': 2, '3H': 3, '4H': 4, '5H': 5, '6H': 6, '7H': 7, '8H': 8, '9H': 9,
         'tH': 10, 'jH': 10, 'qH': 10, 'kH': 10, 'aH': 11,
      };

      for (let card of hand) {
         value += cardValues[card];
      }
      let acesCount = hand.filter(card => card.includes('a')).length;
      while (value > 21 && acesCount > 0) {
         value -= 10;
         acesCount--;
      }
      return value;
   }

   #updateHandValues() {
      this.#currentHand.value = this.#calcHandValue(this.#currentHand.cards);
      this.#dealerValue = this.#calcHandValue(this.#dealerHand);
   };

}
r88.Casino.Craps = class extends r88.Casino.Game {
   Dice = class extends Sprite {

      Die = class extends Sprite {
         value;
         #bitmaps = [];
         #isShooting = false;
         #startX;
         #startY;
         #parent;
         #isUp = false;

         constructor(parent, isUp, x, y, ...args) {
            super(...args);
            this.#startX = x;
            this.#startY = y;
            this.x = x;
            this.y = y;
            this.loadSprites();
            this.#parent = parent;
            this.#isUp = isUp;
         }

         loadSprites() {
            for (let i = 1; this.#bitmaps.length < 6; i++) {
               const bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/craps/', 'd' + i);
               this.#bitmaps.push(bitmap);
            }

            const rnd = Math.floor(Math.random() * 6);
            this.anchor.set(1, 0.5);
            this.scale.x = 0.5;
            this.scale.y = 0.5;
            this.bitmap = this.#bitmaps[rnd];
         }

         update() {
            super.update();

            if (this.#isShooting) {
               if (this.x <= Graphics.boxWidth) {
                  this.x += Graphics.boxWidth / 10 * Graphics.app.ticker.deltaTime;
               } else {
                  this.#isShooting = false;
                  this.stop();
               }
            }
         }

         stop() {
            this.x -= 100 + Math.random() * 100;
            this.angle += Math.random() * 180 - 90;
            this.y += (this.#isUp) ? Math.random() * -10 : Math.random() * 10;
            this.bitmap = this.#bitmaps[this.value - 1];

         }

         start() {
            this.#parent.rollTimer = this.#parent.maxRollTimer
            this.#parent.buttons.get('placeBet').disable();
            this.#parent.playSound({ name: 'dice_roll', volume: 100, pitch: 100 })

            const rnd = Math.ceil(Math.random() * 6);
            this.value = rnd;
            this.angle = 0;
            this.x = this.#startX;
            this.y = this.#startY;
            this.#isShooting = true;
         }

      }

      #die1;
      #die2;
      value;

      constructor(parent, ...args) {
         super(...args);
         this.#die1 = new this.Die(parent, true, 0, Graphics.boxHeight / 2 - 30);
         this.#die2 = new this.Die(parent, false, 0, Graphics.boxHeight / 2 + 30);

         parent.addChild(this.#die1);
         parent.addChild(this.#die2);

      }

      roll() {
         this.#die1.start();
         this.#die2.start();
         this.value = this.#die1.value + this.#die2.value;

      }

   }

   #dice = [];
   #passPoint = 0;
   rollTimer = 0;
   maxRollTimer = 50;

   #passBets = ['pass', 'dPass'];
   #passOddsBets = ['pOdds', 'dPOdds'];
   #comeBets = ['come', 'dCome'];
   #comeOddsBets = ['cOdds4', 'cOdds5', 'cOdds6', 'cOdds8', 'cOdds9', 'cOdds10',
      'dCOdds4', 'dCOdds5', 'dCOdds6', 'dCOdds8', 'dCOdds9', 'dCOdds10'
   ];
   #messageWindow;

   #placeBets = ['place4', 'place5', 'place6', 'place8', 'place9', 'place10']
   #ONBets = [...this.#comeBets, ...this.#passOddsBets];
   #oddsBets = [...this.#passOddsBets, ...this.#comeOddsBets];
   #puck;


   create() {
      super.create();
      this.createChips();
      this.setTable('table_green');
      r88.Casino.Bet.setBetLimit(2, 1);
      this.createButtons();
      this.#updatePuck(0);
      this.#createMessageWindow();
      this.createBankWindow();
      this.#dice = new this.Dice(this);
      this.newGame();
   };

   update() {
      super.update();

      if (this.rollTimer > 0) {
         this.rollTimer -= Graphics.app.ticker.deltaTime;
         if (this.rollTimer < this.maxRollTimer / 10) {
            this.updateBoard();
            this.buttons.get('placeBet').enable();
            this.rollTimer = 0;
         }
         return;
      }
      if (Input.isTriggered('ok') || Input.isTriggered('space')) {
         if (this.buttons.get('placeBet').isVisible) this.placeBet();
      }
   }

   #createMessageWindow() {
      const face = 'Brush Script MT';
      const size = 30;
      let ww = 300;
      let wh = 55;
      let wx = 0;
      let wy = Graphics.boxHeight - this.helpAreaHeight() / 2;
      this.#messageWindow = new r88.Casino.Label(this, new Rectangle(wx, wy, ww, wh));
      this.#messageWindow.fontFace = face;
      this.#messageWindow.fontSize = size;
      this.#messageWindow.text = 'Welcome to Craps'
   }

   #updatePuck(point) {
      if (this.#puck) this.#puck.destroy();

      let betName;
      let bitmap;
      let yOffset = 0;

      if (point === 0) {
         betName = 'dCome';
         bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/craps/', 'craps_OFF');

      } else {
         betName = "cOdds" + point;
         bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/craps/', 'craps_ON');
         yOffset = 75;
      }

      const x = this.bets.get(betName).x;
      const y = this.bets.get(betName).y;

      const puck = new Sprite();
      puck.bitmap = bitmap;
      puck.x = x;
      puck.y = y - yOffset;
      this.#puck = puck;
      this.#passPoint = point;
      this.addChild(this.#puck);

   }

   createButtons() {
      super.createButtons();
      const bh = 48
      const bw = 48;
      const buttonConfigs = [
         { name: "placeBet", x: Graphics.boxWidth - bw * 2, y: Graphics.boxHeight - bh },
      ];

      this.assignButtons(buttonConfigs);
      const cx = Graphics.boxWidth / 6;
      const cy = Graphics.boxHeight / 3;

      const betConfigs = [
         { name: "pass", x: cx - bw * 2, y: cy - bh * 2 },
         { name: "dPass", x: cx - bw, y: cy - bh * 2 },
         { name: "come", x: cx, y: cy },
         { name: "dCome", x: cx, y: cy - bh * 2 },
         { name: "field", x: cx, y: cy + bh * 2 },
         { name: 'pOdds', x: cx + bw * 8.75, y: cy + bh * 5 },
         { name: 'dPOdds', x: cx + bw * 8.75, y: cy + bh * 4 }
      ]

      for (const i of [4, 5, 6, 8, 9, 10]) {
         const j = (i < 7) ? i - 3 : i - 4;
         betConfigs.push(
            { name: "cOdds" + i, x: cx + bw * (1.5 * j), y: cy - bh * 1.5 },
            { name: "dCOdds" + i, x: cx + bw * (1.5 * j), y: cy - bh * 2 },
            { name: "place" + i, x: cx + bw * (1.5 * j), y: cy - bh * 0.25 }
         );
      }

      this.assignBetButtons(betConfigs);
      this.buttons.get('placeBet').enable();
      this.#oddsBets.forEach(bet => { this.bets.get(bet).maxStackHeight = 6 });
      this.#comeOddsBets.forEach(bet => { this.bets.get(bet).disable() });

   };

   newGame() {
      this.#updatePuck(0);
      this.#ONBets.forEach(bet => { this.bets.get(bet).disable() });
      this.#passBets.forEach(bet => { this.bets.get(bet).enable() });
   }

   placeBet() {
      this.#dice.roll();
   }

   scoreAllBets() {

      const comeOutTable = new Map([
         ['pass', { win: [7, 11], lose: [2, 3, 12], payout: 1 }],
         ['dPass', { win: [2, 3], lose: [7, 11], payout: 1 }],
         ['come', { win: [2, 3, 12], lose: [7, 11], payout: 1 }],
         ['dCome', { win: [7, 11], lose: [2, 3], payout: 1 }],
      ]);

      const pointTable = new Map([
         ['pass', { win: [this.#passPoint], lose: [7], payout: 1 }],
         ['dPass', { win: [7], lose: [this.#passPoint], payout: 1 }],
         ['come', { win: [7, 11], lose: [2, 3, 12], payout: 1 }],
         ['dCome', { win: [2, 3], lose: [7, 11], payout: 1 }],
      ]);

      const placeData = {
         'p4': 9 / 5,
         'p5': 7 / 5,
         'p6': 7 / 6,
         'p8': 7 / 6,
         'p9': 7 / 5,
         'p10': 9 / 5,
         'o4': 2,
         'o5': 3 / 2,
         'o6': 6 / 5,
         'o8': 6 / 5,
         'o9': 3 / 2,
         'o10': 2
      }
      for (let i = 4; i <= 10; i++) {
         if (i !== 7) {
            comeOutTable.set('cOdds' + i, { win: [7], lose: [i], payout: placeData['o' + i] });
            comeOutTable.set('dCOdds' + i, { win: [i], lose: [7], payout: 1 / placeData['o' + i] });
            comeOutTable.set('place' + i, { win: [], lose: [], payout: placeData['p' + i] });
            pointTable.set('place' + i, { win: [i], lose: [7], payout: placeData['p' + i] });
            pointTable.set('cOdds' + i, { win: [i], lose: [7], payout: placeData['o' + i] });
            pointTable.set('dCOdds' + i, { win: [7], lose: [i], payout: 1 / placeData['o' + i] });
            pointTable.set('pOdds' + i, { win: [i], lose: [7], payout: placeData['o' + i] });
            pointTable.set('dPOdds' + i, { win: [7], lose: [i], payout: 1 / placeData['o' + i] });
         }
      }

      this.scoreFieldBets();

      const activeBets = [];
      for (const bet of this.bets) {
         if (bet[1].value > 0 && bet[0] !== 'field') activeBets.push(bet[0]);
      }

      for (const betName of activeBets) {
         let betData;
         if (this.#passPoint === 0) {
            betData = comeOutTable.get(betName);
         } else {
            betData = pointTable.get(this.#passOddsBets.includes(betName) ?
               betName + this.#passPoint : betName);

            this.bets.get('come').enable();
            this.bets.get('dCome').enable();
         }

         this.payOut(betName, betData);
      }

   }

   scoreFieldBets() {
      const fieldPayout = (this.#dice.value === 2) ? 2
         : (this.#dice.value === 12) ? 3
            : 1;
      const fieldTable = { win: [2, 3, 4, 9, 10, 11, 12], lose: [5, 6, 7, 8], payout: fieldPayout };
      this.payOut('field', fieldTable);
   }


   payOut(betName, betData) {

      const currentBet = this.bets.get(betName);

      if (betData['win'].includes(this.#dice.value)) {
         this.winBet(betName, betData, currentBet);
         this.enableBets(betName);

      } else if (betData['lose'].includes(this.#dice.value)) {
         currentBet.loseChips();
         this.enableBets(betName);

      } else if (this.#dice.value === 12 && ['dPass', 'dCome'].includes(betName)) {
         currentBet.winChips();
         this.bank += currentBet.value;
         this.enableBets(betName);

      } else if (betName === 'come') {
         this.setComePoint(currentBet, 'cOdds');

      } else if (betName === 'dCome') {
         this.setComePoint(currentBet, 'dCOdds');
      }
   }

   winBet(betName, betData, currentBet) {

      currentBet.winChips();
      this.bank += currentBet.value;

      switch (true) {
         case betName.includes('cOdds'):
         case betName.includes('dCOdds'):
            this.bank += Math.floor((currentBet.getFlatAmount() * betData['payout']));
            this.bank += Math.floor((currentBet.value - currentBet.getFlatAmount()))
            break;
         default:
            this.bank += Math.floor(currentBet.value * betData['payout']);
      }

      this.updateBankWindow();

   }

   enableBets(betName) {
      if (betName.includes('Odds')) {
         this.bets.get(betName).disable();
      } else {
         this.bets.get(betName).enable();
      }

   }

   calcPassOdds(currentBet, type) {
      const passOdds = this.bets.get(type);
      const multiplier = [4, 10].includes(this.#passPoint) ? 3
         : [5, 9].includes(this.#passPoint) ? 4
            : 5;

      passOdds.setFlatAmount(currentBet.value * multiplier);

   }

   setComePoint(currentBet, newBetName) {
      const comePoint = this.bets.get(newBetName + this.#dice.value);
      const multiplier = [4, 10].includes(this.#dice.value) ? 3
         : [5, 9].includes(this.#dice.value) ? 4
            : 5;
      comePoint.setFlatAmount(currentBet.value * multiplier);
      currentBet.moveTo(comePoint)
      comePoint.enable();
      currentBet.reset();
   };

   updateBoard() {
      if (this.#passPoint === 0) {
         // Come-Out Roll
         if ([7, 11].includes(this.#dice.value)) {
            this.scoreAllBets();
            this.#messageWindow.text = "Natural! Pass bets win.";
            this.newGame();

         } else if ([2, 3, 12].includes(this.#dice.value)) {
            this.scoreAllBets();
            this.#messageWindow.text = "Craps! Pass bets lose.";
            this.newGame();

         } else {
            this.scoreFieldBets();
            this.#updatePuck(this.#dice.value);
            this.#messageWindow.text = "The point is set at " + this.#dice.value + ".";
            this.#passBets.forEach(bet => { this.bets.get(bet).disable() });
            this.#comeBets.forEach(bet => { this.bets.get(bet).enable() });

            if (this.bets.get('pass').value > 0) {
               this.bets.get('pOdds').enable();
               this.calcPassOdds(this.bets.get('pass'), 'pOdds')
            }
            if (this.bets.get('dPass').value > 0) {
               this.bets.get('dPOdds').enable();
               this.calcPassOdds(this.bets.get('dPass'), 'dPOdds')
            }
         }

      } else {
         // Point Roll
         if (this.#dice.value === 7) {
            this.#messageWindow.text = "Seven out! New round begins.";
            this.scoreAllBets();
            this.newGame();

         } else if (this.#dice.value === this.#passPoint) {
            this.#messageWindow.text = "Point! Pass bets win.";
            this.scoreAllBets();
            this.newGame();

         } else {
            this.scoreAllBets();
            const grammar = ([8, 11].includes(this.#dice.value)) ? "an " : "a ";
            this.#messageWindow.text = "Shooter rolls " + grammar + this.#dice.value + ".";
         }
      }

      this.bets.get('field').enable();
      this.#placeBets.forEach(betName => {
         const bet = this.bets.get(betName);
         if (bet.value <= 0) {
            bet.enable();
         }
      });

   }

}
r88.Casino.Roulette = class extends r88.Casino.Game {

   Wheel = class extends Sprite {
      #pillTimer = 0;
      #maxPillTimer = 360;
      #parent;
      #interval = 360 / 37;
      #wheelOrder = [0, 32, 15, 19, 4, 21, 2, 25, 17, 13,
         6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
         24, 16, 33, 1, 20, 14, 31, 9, 22, 18,
         29, 7, 28, 12, 35, 3, 26];
      #wheelMap;
      value;

      constructor(parent, ...args) {
         super(...args);
         this.#parent = parent;
         this.#wheelMap = new Map();
         for (let i = 0; i < 37; i++) {
            this.#wheelMap.set(i * this.#interval, this.#wheelOrder[i]);
         }
         this.loadSprites();
         this.#drawStoppedPill(0);
      }

      update() {
         super.update();
         if (this.#pillTimer > 0) {
            this.#pillTimer -= Graphics.app.ticker.deltaTime;

            if (this.pill.angle - this.#interval >= 0) {
               this.pill.angle -= this.#interval * Graphics.app.ticker.deltaTime;

            } else {
               this.pill.angle = this.#interval * 36;
            }

            if (this.#pillTimer < 5) {
               this.stop();
               this.#pillTimer = 0;
            }
         }

         if (this.angle + 1 < 360) {
            this.angle += Graphics.app.ticker.deltaTime;
         } else {
            this.angle = 0;
         }
      }

      loadSprites() {
         const baseSprite = new Sprite();
         baseSprite.bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/roulette/', 'roulette_base');
         baseSprite.x = Graphics.boxWidth / 2;
         baseSprite.y = Graphics.boxHeight - (48 * 3.5);
         baseSprite.anchor.set(0.5, 0.5);
         baseSprite.scale.x = 0.6;
         baseSprite.scale.y = 0.6;
         this.#parent.addChild(baseSprite);

         this.bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/roulette/', 'roulette_wheel');
         this.x = Graphics.boxWidth / 2;
         this.y = Graphics.boxHeight - (48 * 3.5);
         this.anchor.set(0.5, 0.5);
         this.scale.x = 0.6;
         this.scale.y = 0.6;
         this.#parent.addChild(this);
      }

      stop() {
         this.#parent.playSound({ name: 'roulette_stop', volume: 100, pitch: 100 });
         const zeroPillAngle = (this.pill.angle > this.angle) ? this.pill.angle - this.angle
            : this.pill.angle + (360 - this.angle);

         const adjustedAngle = this.#calcValue(zeroPillAngle);
         this.pill.destroy();
         this.#drawStoppedPill(adjustedAngle);
         this.#parent.scoreAllBets(this.value);
      }

      #calcValue(zeroPillAngle) {
         const halfInterval = this.#interval / 2;
         for (const space of this.#wheelMap) {
            const spaceAngle = space[0];

            if (zeroPillAngle > spaceAngle - halfInterval && zeroPillAngle < spaceAngle + halfInterval) {
               this.value = space[1];
               return space[0];
            }
         }
      }

      #drawStoppedPill(zeroPillAngle) {
         const radAngle = (zeroPillAngle - 90) * Math.PI / 180;
         const radius = 160;
         const yTrans = Math.sin(radAngle) * radius;
         const xTrans = Math.cos(radAngle) * radius;
         const stoppedPill = new Sprite();
         this.addChild(stoppedPill);
         this.pill = stoppedPill;
         stoppedPill.bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/roulette/', 'roulette_pill2')
         stoppedPill.x = xTrans;
         stoppedPill.y = yTrans;
         stoppedPill.anchor.set(0.5, 0.5);
      }

      spin() {
         this.#parent.playSound({ name: 'roulette_spin', volume: 80, pitch: 100 });
         this.pill.destroy();
         this.pill = new Sprite();
         this.pill.bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/roulette/', 'roulette_pill1');
         this.pill.anchor.set(0.5, 0.5);
         this.pill.angle = this.#wheelOrder[Math.ceil(Math.random() * 36)] * this.#interval;
         this.pill.x = Graphics.boxWidth / 2;
         this.pill.y = Graphics.boxHeight - (48 * 3.5);
         this.pill.scale.x = 0.6
         this.pill.scale.y = 0.6
         this.#parent.addChild(this.pill);

         this.#pillTimer = this.#maxPillTimer;
      }
   }
   #messageWindow;
   #wheel;

   create() {
      super.create();
      this.createChips();
      this.setTable('table_green');
      r88.Casino.Bet.setBetLimit(3, 1);
      r88.Casino.Bet.setChipScale(0.36);
      this.createButtons();
      this.#createMessageWindow();
      this.createBankWindow();

      this.#wheel = new this.Wheel(this);
   };

   update() {
      super.update();

      if (Input.isTriggered('ok') || Input.isTriggered('space')) {
         if (this.buttons.get('placeBet').isVisible) this.placeBet();
      }
   }

   #createMessageWindow() {
      const face = 'Brush Script MT';
      const size = 30;
      let ww = 300;
      let wh = 55;
      let wx = 0;
      let wy = Graphics.boxHeight - this.helpAreaHeight() / 2;
      this.#messageWindow = new r88.Casino.Label(this, new Rectangle(wx, wy, ww, wh));
      this.#messageWindow.fontFace = face;
      this.#messageWindow.fontSize = size;
      this.#messageWindow.text = 'Welcome to Roulette';
   }

   createButtons() {
      super.createButtons();
      const bh = 48
      const bw = 48;
      const qbw = bw / 4;
      const hbw = bw / 2;
      const buttonConfigs = [
         { name: "placeBet", x: Graphics.boxWidth - bw * 2, y: Graphics.boxHeight - bh },
      ];

      this.assignButtons(buttonConfigs);
      const s1x = Graphics.boxWidth / 2 - bw * 7;
      const s1y = Graphics.boxHeight / 2 - bw * 4;

      const betConfigs = [
         { name: 'straight0', x: s1x - bw, y: s1y - bh * 2 },
         { name: 'firstFour', x: s1x - qbw, y: s1y - bh * 2.25 },
         { name: 'trio0', x: s1x - qbw, y: s1y - qbw },
         { name: 'trio1', x: s1x - qbw, y: s1y - qbw - bh },
         { name: 'dozen0', x: s1x, y: s1y + bh },
         { name: 'dozen1', x: s1x + bw * 4, y: s1y + bh },
         { name: 'dozen2', x: s1x + bw * 8, y: s1y + bh },
         { name: 'low', x: s1x, y: s1y + bh * 2 },
         { name: 'even', x: s1x + bw * 2, y: s1y + bh * 2 },
         { name: 'red', x: s1x + bw * 4, y: s1y + bh * 2 },
         { name: 'black', x: s1x + bw * 6, y: s1y + bh * 2 },
         { name: 'odd', x: s1x + bw * 8, y: s1y + bh * 2 },
         { name: 'high', x: s1x + bw * 10, y: s1y + bh * 2 },
      ]

      const spaces = 's1x + qbw + bw * i'
      const lines = 's1x + hbw + qbw + bw * i';

      for (let i = 0, k = 1; i < 12; i++, k += 3) {
         for (let j = 0; j < 3; j++) {
            betConfigs.push({ name: 'straight' + (k + j), x: eval(spaces), y: s1y + qbw - bh * j });
         }

         betConfigs.push({ name: 'street' + i, x: eval(spaces), y: s1y - bh * 2.25 });
      }
      for (let i = 0, k = 0; i < 11; i++) {
         for (let j = 0; j < 2; j++, k++) {
            betConfigs.push({ name: 'corner' + k, x: eval(lines), y: s1y - qbw - bh * j });
         }

         betConfigs.push({ name: 'six' + i, x: eval(lines), y: s1y - bh * 2.25 });
      }
      for (let i = 0; i < 3; i++) {
         betConfigs.push({ name: 'split' + i, x: s1x - qbw, y: s1y + qbw - bh * i });
      }
      for (let i = 0, k = 3; i < 12; i++) {
         for (let j = 0; j < 2; j++, k++) {
            betConfigs.push({ name: 'split' + k, x: eval(spaces), y: s1y - qbw - bh * j });
         }
      }
      for (let i = 0, k = 27; i < 11; i++) {
         for (let j = 0; j < 3; j++, k++) {
            betConfigs.push({ name: 'split' + k, x: eval(lines), y: s1y + qbw - bh * j });
         }
      }
      for (let j = 0; j < 3; j++) {
         betConfigs.push({ name: 'column' + j, x: s1x + bh * 12, y: s1y - bh * j });
      }
      this.assignBetButtons(betConfigs);

   };

   placeBet() {
      this.buttons.get('placeBet').disable();
      for (const bet of this.bets) {
         bet[1].disable();
      }
      this.#wheel.spin();
   }

   scoreAllBets(winningNumber) {
      this.#messageWindow.text = "Winning number is " + winningNumber + ".";
      const betTable = {
         'black': [
            [2, 4, 6, 8, 10, 11, 13, 15, 17, 20,
               22, 24, 26, 28, 29, 31, 33, 35]
         ],
         'column': [
            [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
            [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
            [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
         ],
         'corner': [
            [1, 2, 4, 5], [2, 3, 5, 6],
            [4, 5, 7, 8], [5, 6, 8, 9],
            [7, 8, 10, 11], [8, 9, 11, 12],
            [10, 11, 13, 14], [11, 12, 14, 15],
            [13, 14, 16, 17], [14, 15, 17, 18],
            [16, 17, 19, 20], [17, 18, 20, 21],
            [19, 20, 22, 23], [20, 21, 23, 24],
            [22, 23, 25, 26], [23, 24, 26, 27],
            [25, 26, 28, 29], [26, 27, 29, 30],
            [28, 29, 31, 32], [29, 30, 32, 33],
            [31, 32, 34, 35], [32, 33, 35, 36]
         ],
         'dozen': [
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]
         ],
         'even': [
            [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24,
               26, 28, 30, 32, 34, 36]
         ],
         'firstFour': [
            [0, 1, 2, 3]
         ],
         'high': [
            [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
               30, 31, 32, 33, 34, 35, 36]
         ],
         'low': [
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
               14, 15, 16, 17, 18]
         ],
         'odd': [
            [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23,
               25, 27, 29, 31, 33, 35]
         ],
         'red': [
            [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21,
               23, 25, 27, 30, 32, 34, 36]
         ],
         'six': [
            [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12],
            [13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 24],
            [25, 26, 27, 28, 29, 30], [31, 32, 33, 34, 35, 36]
         ],
         'straight': [
            [0], [1], [2], [3], [4], [5], [6], [7], [8], [9],
            [10], [11], [12], [13], [14], [15], [16], [17], [18],
            [19], [20], [21], [22], [23], [24], [25], [26], [27],
            [28], [29], [30], [31], [32], [33], [34], [35], [36]
         ],
         'street': [
            [1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12],
            [13, 14, 15], [16, 17, 18], [19, 20, 21], [22, 23, 24],
            [25, 26, 27], [28, 29, 30], [31, 32, 33], [34, 35, 36]
         ],
         'trio': [
            [0, 1, 2], [0, 2, 3]
         ]
      }

      const split = [[0, 1], [0, 2], [0, 3]];
      for (const str of betTable['street']) {
         split.push([str[0], str[1]], [str[1], str[2]]);
      }
      for (let i = 1; i <= 33; i++) {
         split.push([i, i + 3]);
      }

      Object.assign(betTable, { 'split': split });

      const activeBets = [];
      for (const bet of this.bets) {
         if (bet[1].value > 0 && bet[0]) activeBets.push(bet[0]);
      }

      for (const betName of activeBets) {
         let index;
         let name = '';

         [name, index] = this.exciseNumber(betName);

         if (betTable[name][index].includes(winningNumber)) {
            const payRatio = Math.floor(35 / betTable[name][0].length);
            this.bets.get(betName).winChips();

            this.bank += this.bets.get(betName).value;
            this.bank += this.bets.get(betName).value * payRatio;

            this.updateBankWindow();

         } else {
            this.bets.get(betName).loseChips();
         }
      }

      for (const bet of this.bets) {
         bet[1].enable();
      }
   }

   exciseNumber(betName) {
      const numArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      const oneOver = betName.slice(-1);
      const twoOver = betName.slice(-2, -1);
      let number = 0;
      let newName = betName;

      if (numArray.includes(oneOver)) {
         if (numArray.includes(twoOver)) {
            number = Number(twoOver + oneOver);
            newName = betName.slice(0, -2);

         } else {
            number = Number(oneOver);
            newName = betName.slice(0, -1);
         }
      }

      return [newName, number];
   }

}
r88.Casino.Slots = class extends r88.Casino.Game {
   #reels = [];
   #beepTimer = 0;
   #beepTimerMax = 6;
   #startBeep = false;

   Reel = class extends Window {
      #index;
      #r1;
      #r2;
      #parent;
      #currentSymbol;

      #symbolCount = 6;
      #width = 140;
      #reelHeight = 720;
      #spinTimer = 0;
      #maxSpinTimer = 50;
      #gap = 20;
      #posArray = [-660, -600, -540, -480, -420, -360, -300, -240, -180, -120, -60,
         0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660];

      #symbols = ['C', ' ', 'B2', ' ', 'BELL', ' ', 'G', ' ', 'B1', ' ', 'S',
         ' ', 'C', ' ', 'B2', ' ', 'BELL', ' ', 'G', ' ', 'B1', ' ', 'S'];

      #height = (this.#reelHeight / this.#symbolCount) / 2;
      #start = -this.#height;
      #max = this.#start + this.#reelHeight;


      constructor(index, parent, ...args) {
         super(...args);
         this.#index = index;
         this.#drawSprites(parent);
         this.#parent = parent;
      }

      #drawSprites(parent) {
         const startX = Graphics.boxWidth / 2 - this.#gap - this.#width * 1.5

         this.#r1 = new Sprite();
         this.#r1.bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/slots/', 'slot_reel');
         this.#r1.anchor.set = (0.5, 1);
         this.#r1.y = this.#start;
         this.#r1.x = startX + (this.#width * this.#index) + (this.#gap * this.#index);
         parent.addChild(this.#r1);

         this.#r2 = new Sprite();
         this.#r2.bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/slots/', 'slot_reel');
         this.#r1.anchor.set = (0.5, 1);
         this.#r2.y = this.#max;
         this.#r2.x = startX + (this.#width * this.#index) + (this.#gap * this.#index);

         parent.addChild(this.#r2);
      }

      update() {

         if (this.#spinTimer > 0 || !this.#posArray.includes(this.#r1.y)) {
            this.#spinTimer -= Graphics.app.ticker.deltaTime;

            this.spin();
         }
      }

      getSymbol() {
         return this.#currentSymbol;
      }

      start() {
         this.#spinTimer = this.#maxSpinTimer + this.#index * 30;
      }

      spin() {

         const rnd = (Math.random() < 0.5) ? 1 : 0.5;
         this.#r1.y += this.#height * rnd;
         this.#r2.y += this.#height * rnd;

         if (this.#r1.y >= this.#max) this.#r1.y = this.#r2.y - this.#reelHeight;
         if (this.#r2.y >= this.#max) this.#r2.y = this.#r1.y - this.#reelHeight;

         if (this.#spinTimer <= 0 && this.#posArray.includes(this.#r1.y)) {
            this.#currentSymbol = this.#symbols[this.#posArray.findIndex((index) => index === this.#r1.y)];
            this.#parent.playSound({ name: 'reel_click', volume: 25, pitch: 150 });

            if (this.#index === 2) {
               this.#parent.calcPayout();
            }
         }
      }
   }

   create() {
      super.create();
      this.#createReels();
      this.setTable('none');
      this.#createMachine();
      this.createButtons();
      this.createBankWindow(Graphics.boxWidth - 200, Graphics.boxHeight - 96);
      Input.keyMapper[32] = 'space';
      this.bet = 5;
   };

   #createReels() {
      for (let i = 0; this.#reels.length < 3; i++) {
         const reel = new this.Reel(i, this);
         this.#reels.push(reel);
      }
   };

   calcPayout() {
      this.#startBeep = false;
      const set = [];
      let payOut = 0;
      let payOutTable = JSON.parse(r88.Casino.parameters['Slot Payouts'])
      for (const reel of this.#reels) {
         set.push(reel.getSymbol());
      }

      const counts = { B1: 0, B2: 0, BELL: 0, C: 0, G: 0, S: 0 };
      for (const symbol of set) {
         counts[symbol]++;
      }

      let index = counts.S === 3 ? 7
         : counts.C === 3 || counts.BELL === 3 ? 6
            : counts.B2 === 3 || (counts.BELL === 2 && counts.C === 1) ? 5
               : counts.B1 === 3 || (counts.BELL === 1 && counts.C === 2) ? 4
                  : counts.G === 3 || (counts.BELL === 1 && counts.C === 1) ? 3
                     : (counts.B1 + counts.B2) === 3 || counts.C === 2 ? 2
                        : counts.C === 1 ? 1
                           : 0;

      payOut = payOutTable[index];
      this.bank += payOut;

      if (payOut !== 0) {
         this.playSound({ name: 'pay' + index, volume: 50, pitch: 100 });
      }
      this.updateBankWindow();

      if (this.bank >= 5) {
         this.buttons.get('spinReels').enable();
      }
   }

   update() {
      super.update();

      if (this.buttons.get('spinReels').isVisible &&
         (Input.isTriggered('ok') || Input.isTriggered('space'))) this.spinReels();

      if (this.#startBeep) {
         this.#beepTimer -= Graphics.app.ticker.deltaTime;

         if (this.#beepTimer < 0) {
            this.#beep();
            this.#beepTimer = this.#beepTimerMax;
         }
      }

      for (const reel of this.#reels) {
         reel.update();
      }

   };

   #beep() {
      const rnd = Math.floor(Math.random() * 4);
      const pitches = [280, 310, 350, 430];
      this.playSound({ name: 'beep', volume: 25, pitch: pitches[rnd] });
   }

   createButtons() {
      super.createButtons();
      const bh = 48;
      const bw = 48;

      const buttonConfigs = [
         { name: "spinReels", x: Graphics.boxWidth - bw * 2, y: Graphics.boxHeight - bh },
      ];

      this.assignButtons(buttonConfigs);
      this.buttons.get('spinReels').enable();

      if (this.bank < 5) {
         this.buttons.get('spinReels').disable();
      }
   }

   #createMachine() {
      const machine = new Sprite();
      const bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/slots/', 'slot_machine');
      machine.bitmap = bitmap;
      machine.anchor.set(0.5, 0.5);
      machine.x = Graphics.boxWidth / 2 + 3;
      machine.y = Graphics.boxHeight / 2 + 4;
      this.addChild(machine);
   }


   spinReels() {
      this.#startBeep = true;
      this.playSound({ name: 'button', volume: 50, pitch: 100 });
      this.buttons.get('spinReels').disable();
      this.#reels[0].start();
      this.#reels[1].start();
      this.#reels[2].start();

      this.bank -= this.bet;
      this.updateBankWindow();
   }

};
r88.Casino.VideoPoker = class extends r88.Casino.CardGame {

   Paytable = class extends Sprite {
      #table =
         {
            'ROYAL FLUSH': [250, 500, 750, 1000, 4000],
            'STRAIGHT FLUSH': [50, 100, 150, 200, 250],
            'FOUR OF A KIND': [25, 50, 75, 100, 125],
            'FULL HOUSE': [9, 18, 27, 36, 45],
            'FLUSH': [6, 12, 18, 24, 30],
            'STRAIGHT': [4, 8, 12, 16, 20],
            'THREE OF A KIND': [3, 6, 9, 12, 15],
            'TWO PAIR': [2, 4, 6, 8, 10],
            'JACKS OR BETTER': [1, 2, 3, 4, 5],
            ' ': [0, 0, 0, 0, 0]
         }

      #bitmaps = [];
      #column = 0;

      constructor(...args) {
         super(...args);

         this.loadSprites();
      }

      loadSprites() {
         for (let i = 0; i < 5; i++) {
            const bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/vpoker/', 'pt' + i);
            this.#bitmaps.push(bitmap);
         }

         this.bitmap = this.#bitmaps[this.#column];

      }

      set column(index) {
         this.#column = index;
         this.bitmap = this.#bitmaps[this.#column];
      }

      get column() {
         return this.#column;
      }

      getSprite() {
         return this.#bitmaps[this.#column];
      }

      getCredits(handRank) {
         return this.#table[handRank][this.#column];
      }

   }

   #cardValues =
      Object.freeze({
         '2C': 2, '3C': 3, '4C': 4, '5C': 5, '6C': 6, '7C': 7, '8C': 8, '9C': 9, 'tC': 10, 'jC': 11, 'qC': 12, 'kC': 13, 'aC': 1,
         '2S': 2, '3S': 3, '4S': 4, '5S': 5, '6S': 6, '7S': 7, '8S': 8, '9S': 9, 'tS': 10, 'jS': 11, 'qS': 12, 'kS': 13, 'aS': 1,
         '2D': 2, '3D': 3, '4D': 4, '5D': 5, '6D': 6, '7D': 7, '8D': 8, '9D': 9, 'tD': 10, 'jD': 11, 'qD': 12, 'kD': 13, 'aD': 1,
         '2H': 2, '3H': 3, '4H': 4, '5H': 5, '6H': 6, '7H': 7, '8H': 8, '9H': 9, 'tH': 10, 'jH': 11, 'qH': 12, 'kH': 13, 'aH': 1,
      });

   #hand = ['2C', '3S', '4D', '5H', '7C'];
   #holdButtons;
   #rankDisplay;
   #gameOverSprite;
   #gameOver = true;
   #isHidden = true;
   #payTable;
   #enableBetOne = false;

   create() {
      super.create();

      this.setTable('table_blue');
      this.#createRankDisplay();
      this.createButtons();
      this.createBankWindow();
      this.#createPayTable();
      this.#createHoldButtons();

      for (let i = 0; i < 5; i++) {
         Input.keyMapper[49 + i] = 'hold' + i;
      }

      this.#updateImages();
      this.bet = 1;
   };

   update() {
      super.update();

      if (Input.isTriggered('ok') || Input.isTriggered('space')) {
         if (this.buttons.get('dealDraw').isVisible) this.dealDraw();
      }

      if (!this.#holdButtons[0].isVisible) return;

      for (let i = 0; i < 5; i++) {
         if (Input.isTriggered('hold' + i)) {
            this.hold(i);
         }
      }

   }

   createButtons() {
      super.createButtons();
      const bh = 48;
      const bw = 48;

      const buttonConfigs = [
         { name: "dealDraw", x: Graphics.boxWidth - bw * 2, y: Graphics.boxHeight - bh },
         { name: "betOne", x: bw, y: Graphics.boxHeight - bh },
         { name: "maxBet", x: bw * 2, y: Graphics.boxHeight - bh }
      ];

      this.assignButtons(buttonConfigs);

      this.buttons.get('dealDraw').enable();
      this.buttons.get('betOne').enable();
      this.buttons.get('maxBet').enable();

      if (this.bank < 5) {
         this.buttons.get('dealDraw').disable();
         this.buttons.get('betOne').disable();
         this.buttons.get('maxBet').disable();
      }

   }

  
   #createGameOver(cardsY) {
      this.#gameOverSprite = new Sprite();
      this.#gameOverSprite.bitmap = ImageManager.loadBitmap('img/pictures/r88_Casino_pictures/vpoker/', 'gameOver');
      this.#gameOverSprite.anchor.set(0.5, 0.5);
      this.#gameOverSprite.x = Graphics.boxWidth / 2;
      this.#gameOverSprite.y = cardsY;
      this.addChild(this.#gameOverSprite);
   }

   #createHoldButtons() {
      this.#holdButtons = [];

      const cw = this.cardWidth;

      for (let i = 0; i < 5; i++) {
         const bw = 72;
         const bh = 48;
         const button = new r88.Casino.ToggleButton('hold');
         this.addWindow(button);
         button.setClickHandler(this.hold.bind(this, i));
         button.x = (Graphics.boxWidth / 2 - bw * 2.5) + 72 * i;
         button.y = Graphics.boxHeight - bh;

         let ww = cw;
         let wh = this.helpAreaHeight();
         let wx = (Graphics.boxWidth / 2 - cw * 2.5) + cw * i;
         let wy = Graphics.boxHeight / 2 + wh / 6;

         const holdLabel = new r88.Casino.Label(this, new Rectangle(wx, wy, ww, wh));
         holdLabel.fontSize = 20;
         holdLabel.fontFace = 'Lucida Console';
         holdLabel.text = '';
         holdLabel.outlineWidth = 0;
         button.holdLabel = holdLabel;

         this.#holdButtons.push(button);
         button.disable();
      }
   }

   #createPayTable() {
      this.#payTable = new this.Paytable();
      this.#payTable.anchor.set(0.5, 0.5);
      this.#payTable.x = Graphics.boxWidth / 2;
      this.#payTable.y = Graphics.boxHeight / 3.5;
      this.addChild(this.#payTable);
   }

   #createRankDisplay() {
      const face = 'Lucida Console';
      const size = 25;
      let ww = 300;
      let wh = this.helpAreaHeight();
      let wx = Graphics.boxWidth / 2 - ww / 2;
      let wy = Graphics.boxHeight / 2.25;
      this.#rankDisplay = new r88.Casino.Label(this, new Rectangle(wx, wy, ww, wh));
      this.#rankDisplay.fontFace = face;
      this.#rankDisplay.fontSize = size;
      this.#rankDisplay.outlineWidth = 0;
   }

   betOne() {
      this.playSound({ name: 'beep', volume: 50, pitch: 100 });

      if (this.#payTable.column < 4) {
         this.buttons.get('maxBet').enable();
         this.#payTable.column = this.#payTable.column + 1;
      }

      if (this.#payTable.column >= 4) {
         if (this.#enableBetOne) {
            this.#payTable.column = 0;
            this.buttons.get('maxBet').enable();
         } else {
            this.buttons.get('betOne').disable();
            this.buttons.get('maxBet').disable();
         }

         this.#enableBetOne = false;
      }

      this.bet = this.#payTable.column + 1;

   }

   maxBet() {
      this.playSound({ name: 'beep', volume: 50, pitch: 100 });
      this.#payTable.column = 4;
      this.buttons.get('betOne').disable();
      this.buttons.get('maxBet').disable();

      this.bet = 5;
   }


   #updateImages() {
      for (const cardSprite of this.cardSprites) {
         cardSprite.destroy();
      }
      this.cardSprites = [];
      const scale = 1;
      const ch = this.cardHeight * scale;
      const cw = this.cardWidth * scale;

      const y = Graphics.boxHeight / 2 + ch / 1.25;
      for (let i = 0; i < this.#hand.length; i++) {
         const cardInterval = cw * i;
         const startX = (Graphics.boxWidth / 2) - cw * 2;
         const x = startX + cardInterval;
         this.drawCard(this.#hand[i], x, y, this.#isHidden, scale, 0, 255);
      }

      if (this.#gameOver) {
         this.#createGameOver(y);
      } else {
         this.#gameOverSprite.destroy();
      }
   }



   hold(i) {
      this.playSound({ name: 'button', volume: 10, pitch: 90 });
      this.playSound({ name: 'beep', volume: 50, pitch: 250 });
      const button = this.#holdButtons[i];
      button.toggle();

      if (button.isOn) {
         button.holdLabel.text = 'HOLD';
      } else {
         button.holdLabel.text = '';
      }
   }

   dealDraw() {
      this.#isHidden = false;
      this.playSound({ name: 'button', volume: 40, pitch: 150 });
      this.playSound({ name: 'beep', volume: 50, pitch: 100 });

      this.buttons.get('betOne').disable();
      this.buttons.get('maxBet').disable();

      if (this.#gameOver) {

         for (const button of this.#holdButtons) {
            button.enable();
         }

         this.refreshDeck(1);
         this.bank -= this.bet;
         this.updateBankWindow();

         for (let i = 0; i < this.#hand.length; i++) {
            if (this.#holdButtons[i].isOn === false) continue;
            this.hold(i);
         }

         this.#hand = [];
         while (this.#hand.length < 5) {
            this.#hand.push(this.deck.pop());
         }
         this.#gameOver = false;

      } else {

         for (let i = 0; i < 5; i++) {
            if (this.#holdButtons[i].isOn) continue;
            this.#hand[i] = this.deck.pop();
         }

         for (const button of this.#holdButtons) {
            button.disable();
         }
         this.#gameOver = true;
      }

      this.#updateImages();
      const handRank = this.#evaluateHand(this.#hand);
      this.#rankDisplay.text = handRank;

      if (this.#gameOver) {
         this.buttons.get('betOne').enable();
         this.#enableBetOne = true;
         if (this.#payTable.column !== 4) this.buttons.get('maxBet').enable();

         const payout = this.#payTable.getCredits(handRank);
         this.bank += payout;
         this.updateBankWindow();
         if (this.bank < 5) {
            this.buttons.get('dealDraw').disable();
            this.buttons.get('betOne').disable();
            this.buttons.get('maxBet').disable();
         }
   
      }

   }

   #evaluateHand(hand) {
      const rankCounts = this.#getRankCounts(hand);
      const valueArray = Array.from(rankCounts.values());

      let isRoyal = (hand[4].slice(0, 1) === 'a')
      let isStraight = this.#checkStraight(hand);
      let isFlush = this.#checkFlush(hand);
      let isJacksOrBetter = this.#checkJacksOrBetter(rankCounts)
      let isTwoPair = this.#checkTwoPair(valueArray);
      let isThree = valueArray.includes(3);
      let isFour = valueArray.includes(4);
      let isFullHouse = valueArray.includes(2) && isThree;


      switch (true) {
         case isRoyal && isStraight && isFlush:
            return 'ROYAL FLUSH';
         case isStraight && isFlush:
            return 'STRAIGHT FLUSH';
         case isFour:
            return 'FOUR OF A KIND';
         case isFullHouse:
            return 'FULL HOUSE';
         case isFlush:
            return 'FLUSH';
         case isStraight:
            return 'STRAIGHT';
         case isThree:
            return 'THREE OF A KIND';
         case isTwoPair:
            return 'TWO PAIR'
         case isJacksOrBetter:
            return 'JACKS OR BETTER';
      }

      return ' '
   }

   #checkTwoPair(valueArray) {
      const pairArray = valueArray.filter((value) => value === 2);
      if (pairArray.length === 2) {
         return true;
      }

      return false;
   }

   #checkJacksOrBetter(rankCounts) {
      const highRanks = ['j', 'q', 'k', 'a'];
      for (const rank of highRanks) {
         if (rankCounts.has(rank)) {
            const value = rankCounts.get(rank);
            if (value >= 2) return true;
         }
      }

      return false;
   }

   #checkStraight(hand) {
      let priorValue = this.#cardValues[hand[0]];
      for (let i = 1; i < hand.length; i++) {
         const thisValue = this.#cardValues[hand[i]];
         if (thisValue !== priorValue + 1 && (priorValue - thisValue) !== 12) {
            return false;
         }
         priorValue = thisValue;
      }

      return true;
   }

   #checkFlush(hand) {
      for (let i = 1; i < hand.length; i++) {
         const firstSuit = hand[0].slice(-1);
         const thisSuit = hand[i].slice(-1);
         if (firstSuit !== thisSuit) return false;
      }

      return true;
   }

   #getRankCounts(hand) {
      let rankArray = [];
      for (let i = 0; i < hand.length; i++) {
         rankArray.push(hand[i].slice(0, 1));
      }

      const rankCounts = new Map();

      for (let i = 0; i < rankArray.length; i++) {
         const rank = rankArray[i];

         if (rankCounts.has(rank)) {
            const newValue = rankCounts.get(rank) + 1;
            rankCounts.set(rank, newValue);
         } else {
            rankCounts.set(rank, 1);
         }
      }

      return rankCounts;
   }

};

r88.Casino.games = ["Baccarat", "Blackjack", "Craps", "Roulette", "Slots", "VideoPoker"];
r88.Casino.games.forEach(game => {
   const launchGame = game => () => SceneManager.push(r88.Casino[game]);
   PluginManager.registerCommand("r88_Casino", game, launchGame(game));
});