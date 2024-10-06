import { Application } from 'pixi.js';
import { GUI } from 'dat.gui';
import { Cell } from './cell';

const app = new Application();
// @ts-ignore
globalThis.__PIXI_APP__ = app;
await app.init({
  resizeTo: window
});
document.body.appendChild(app.canvas);
app.canvas.setAttribute('style', 'display: block');

const DEFAULT_UNIVERSE_SIZE = 100;
const DEFAULT_UNIVERSE_COLOR = 0x000000;
const DEFAULT_CELL_SIZE = 20;
const DEFAULT_CELL_COLOR = 0xffffff;
const DEFAULT_TICK_RATE = 10;

let cells: Array<Array<Cell>> = [];
let timer = 0;
let livingCells: Array<{ column: number; row: number }> = [];

const values = {
  universeSize: { width: DEFAULT_UNIVERSE_SIZE, height: DEFAULT_UNIVERSE_SIZE },
  universeColor: DEFAULT_UNIVERSE_COLOR,
  cellSize: { width: DEFAULT_CELL_SIZE, height: DEFAULT_CELL_SIZE },
  cellColor: DEFAULT_CELL_COLOR,
  tickRate: { FPS: DEFAULT_TICK_RATE, max: 60, min: 0 },
  isStarted: false,
  autoLoad: localStorage.getItem('autoLoad') === 'true' ? true : false
};

resizeUniverse(DEFAULT_UNIVERSE_SIZE);

window.onkeydown = (event) => {
  if ([' ', 'k'].includes(event.key)) {
    values.isStarted ? stop() : start();
  }

  if (['+', '=', 'l'].includes(event.key)) {
    if (values.tickRate.FPS < values.tickRate.max) values.tickRate.FPS += 1;
  }

  if (['-', '_', 'j'].includes(event.key)) {
    if (values.tickRate.FPS > values.tickRate.min) values.tickRate.FPS -= 1;
  }
}

const gui = new GUI();
const universeData = gui.addFolder('Universe');
universeData
  .addColor(values, 'universeColor').onChange(() => {
    app.renderer.background.color = values.universeColor;
  }).listen();
universeData
  .add(values.universeSize, 'width', 10, 300).listen();
universeData
  .add(values.universeSize, 'height', 10, 300).listen();
universeData
  .add({
    'Resize': () => resizeUniverse(values.universeSize.width, values.universeSize.height)
  }, 'Resize');
universeData
  .add({
    'Reset to default': () => {
      app.renderer.background.color = DEFAULT_UNIVERSE_COLOR;
      resizeUniverse(DEFAULT_UNIVERSE_SIZE);
    }
  }, 'Reset to default');

const cellData = gui.addFolder('Cells');
cellData.addColor(values, 'cellColor').onChange(() => {
  for (let i = 0; i < cells.length; i++) {
    const columnCells = cells[i];
    for (let j = 0; j < columnCells.length; j++) {
      const cell = columnCells[j];
      cell.color(values.cellColor);
    }
  }
});
cellData.add(values.cellSize, 'height', 5, 50).listen();
cellData.add(values.cellSize, 'width', 5, 50).listen();
cellData
  .add({
    'Resize': () => resizeCells(values.cellSize.width, values.cellSize.height)
  }, 'Resize');
cellData
  .add({
    'Reset to default': () => resizeCells(DEFAULT_CELL_SIZE)
  }, 'Reset to default');

gui.add(values.tickRate, 'FPS', values.tickRate.min, values.tickRate.max).listen();

gui.add(values, 'autoLoad')
  .onChange((val: boolean) => window.localStorage.setItem('autoLoad', String(val)));

gui.add({
  'Clear Cells': () => clear()
}, 'Clear Cells');
gui.add({
  'Clear Memory': () => clearMemory()
}, 'Clear Memory');
gui.add({
  'Save State': () => storeState()
}, 'Save State');
gui.add({
  'Load State': () => {
    clear();
    loadState();
  }
}, 'Load State');

function clear() {
  for (let i = 0; i < cells.length; i++) {
    const columnCells = cells[i];
    for (let j = 0; j < columnCells.length; j++) {
      const cell = columnCells[j];
      cell.queueState('DEAD');
      cell.update();
    }
  }
}

function clearMemory() {
  localStorage.clear();
  livingCells = [];
}

function storeState() {
  const data = JSON.stringify(livingCells);

  window.localStorage.setItem('storedState', data);
}

function loadState() {
  const storedState = window.localStorage.getItem('storedState');
  if (storedState) {
    livingCells = JSON.parse(storedState);
  }

  livingCells.forEach(({ column, row }) => {
    const cell = cells[column][row];
    cell.queueState('ALIVE');
    cell.update();
  });
}

function start() {
  values.isStarted = true;
  for (let i = 0; i < cells.length; i++) {
    const columnCells = cells[i];
    for (let j = 0; j < columnCells.length; j++) {
      const cell = columnCells[j];
      cell.play();
    }
  }
}

function stop() {
  values.isStarted = false;
  for (let i = 0; i < cells.length; i++) {
    const columnCells = cells[i];
    for (let j = 0; j < columnCells.length; j++) {
      const cell = columnCells[j];
      cell.stop();
    }
  }
}

function resizeUniverse(width: number, height: number = width) {
  if (values.isStarted) return;
  app.stage.removeChildren();
  cells = [];
  for (let col = 0; col < width; col++) {
    const columnCells: Array<Cell> = [];
    for (let row = 0; row < height; row++) {
      const cell = new Cell(col, row);
      cell.x = col * values.cellSize.width;
      cell.y = row * values.cellSize.height;
      app.stage.addChild(cell);
      cell.resize(values.cellSize.width, values.cellSize.height);

      cell.on('mousedown', () => {
        if (!values.isStarted) {
          cell.queueState(cell.state === 'ALIVE' ? 'DEAD' : 'ALIVE');
          cell.update();
          if (cell.state === 'ALIVE') livingCells.push({ column: cell.column, row: cell.row });
        }
      });

      columnCells.push(cell);
    }
    cells.push(columnCells);
  }
}

function resizeCells(width: number, height: number = width) {
  if (!values.isStarted) {
    for (let i = 0; i < cells.length; i++) {
      const columnCells = cells[i];
      for (let j = 0; j < columnCells.length; j++) {
        const cell = columnCells[j];
        cell.resize(width, height);
        cell.x = i * width;
        cell.y = j * height;
      }
    }
  }
}

if (values.autoLoad) {
  loadState();
}

app.ticker.add(({ elapsedMS }) => {
  if (!values.isStarted) return;

  timer += elapsedMS;

  if (timer < 1000 / values.tickRate.FPS) return;
  timer = 0;
  for (let col = 0; col < cells.length; col++) {
    for (let row = 0; row < cells[col].length; row++) {
      const cell = cells[col][row];
      let numLiveNeighbours = 0;

      if (row > 0) {
        cells[col][row - 1].state === 'ALIVE' && numLiveNeighbours++;

        if (col > 0) {
          cells[col - 1][row - 1].state === 'ALIVE' && numLiveNeighbours++;
        }

        if (col < cells.length - 1) {
          cells[col + 1][row - 1].state === 'ALIVE' && numLiveNeighbours++;
        }
      }

      if (row < cells[col].length - 1) {
        cells[col][row + 1].state === 'ALIVE' && numLiveNeighbours++;

        if (col > 0) {
          cells[col - 1][row + 1].state === 'ALIVE' && numLiveNeighbours++;
        }

        if (col < cells.length - 1) {
          cells[col + 1][row + 1].state === 'ALIVE' && numLiveNeighbours++;
        }
      }

      if (col > 0) {
        cells[col - 1][row].state === 'ALIVE' && numLiveNeighbours++;
      }

      if (col < cells.length - 1) {
        cells[col + 1][row].state === 'ALIVE' && numLiveNeighbours++;
      }

      switch (true) {
        case numLiveNeighbours < 2 || numLiveNeighbours > 3:
          if (cell.state === 'ALIVE') cell.queueState('DEAD'); break;

        case numLiveNeighbours === 2 || numLiveNeighbours === 3:
          if (cell.state === 'ALIVE') cell.queueState('ALIVE');
          if (cell.state === 'DEAD' && numLiveNeighbours === 3) cell.queueState('ALIVE');
          break;

        default:
          cell.queueState(cell.state);
          break;
      }
    }
  }

  livingCells = [];
  for (let col = 0; col < cells.length; col++) {
    for (let row = 0; row < cells[col].length; row++) {
      const cell = cells[col][row];
      cell.update();
      cell.state === 'ALIVE' && livingCells.push({ column: col, row });
    }
  }
});
