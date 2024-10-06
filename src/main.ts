import { Application } from 'pixi.js';
import { GUI } from 'dat.gui';
import { Cell, CELL_SIZE } from './cell';

const app = new Application();
// @ts-ignore
globalThis.__PIXI_APP__ = app;
await app.init({
  resizeTo: window
});
document.body.appendChild(app.canvas);

const UNIVERSE_SIZE = 100;
const cells: Array<Array<Cell>> = [];

for (let col = 0; col < UNIVERSE_SIZE; col++) {
  const columnCells: Array<Cell> = [];
  for (let row = 0; row < UNIVERSE_SIZE; row++) {
    const cell = new Cell(col, row);
    cell.x = col * CELL_SIZE;
    cell.y = row * CELL_SIZE;
    app.stage.addChild(cell);

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

let timer = 0;
let livingCells: Array<{ column: number; row: number }> = [];

const values = {
  tickRate: 100,
  isStarted: false,
  autoLoad: localStorage.getItem('autoLoad') === 'true' ? true : false
};

window.onkeydown = (event) => {
  if (event.key === ' ') {
    values.isStarted ? stop() : start();
  }

  if (event.key === '+' || event.key === '=') {
    values.tickRate -= 100;
  }

  if (event.key === '-' || event.key === '_') {
    values.tickRate += 100;
  }
}

const gui = new GUI();
gui.add(values, 'tickRate', 1, 1000).listen();
gui.add(values, 'autoLoad')
  .onChange((val: boolean) => window.localStorage.setItem('autoLoad', String(val)));
gui.add({ 'Clear': () => clear() }, 'Clear');
gui.add({ 'Clear Memory': () => clearMemory() }, 'Clear Memory');
gui.add({ 'Save': () => storeState() }, 'Save');
gui.add({
  'Load': () => {
    clear();
    loadState();
  }
}, 'Load');

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

if (values.autoLoad) {
  loadState();
}

app.ticker.add(({ elapsedMS }) => {
  if (!values.isStarted) return;

  timer += elapsedMS;

  if (timer < values.tickRate) return;
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
