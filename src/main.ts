import { Application } from 'pixi.js';
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
    const cell = new Cell();
    cell.x = col * CELL_SIZE;
    cell.y = row * CELL_SIZE;
    app.stage.addChild(cell);

    cell.on('mousedown', () => {
      if (!isStarted) {
        cell.queueState(cell.state === 'ALIVE' ? 'DEAD' : 'ALIVE');
        cell.update();
      }
    });
    columnCells.push(cell);
  }
  cells.push(columnCells);
}

let timer = 0;
let tickRate = 100;
let isStarted = false;

window.onkeydown = (event) => {
  if (event.key === " ") {
    isStarted = !isStarted;
  }
}

app.ticker.add(({ elapsedMS }) => {
  if (!isStarted) return;

  timer += elapsedMS;

  if (timer < tickRate) return;
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
          if (cell.state === 'ALIVE') cell.queueState('DEAD');          break;

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

  for (let col = 0; col < cells.length; col++) {
    for (let row = 0; row < cells[col].length; row++) {
      const cell = cells[col][row];
      cell.update();
    }
  }
});
