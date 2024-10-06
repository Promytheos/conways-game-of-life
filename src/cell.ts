import { Container, Graphics } from "pixi.js";

export const CELL_SIZE = 20;
type CellState = 'DEAD' | 'ALIVE';

export class Cell extends Container {
  public state: CellState = 'DEAD';
  private nextState: CellState = 'DEAD';

  private readonly _fill: Graphics;

  constructor() {
    super();
    this._fill = new Graphics()
      .rect(0, 0, CELL_SIZE, CELL_SIZE)
      .fill({ color: 0xffffff });
    this._fill.alpha = 0;

    this.addChild(new Graphics()
      .rect(0, 0, CELL_SIZE, CELL_SIZE)
      .stroke({ width: 1, color: 0x222222 }));

    this.addChild(this._fill);

    this.eventMode = 'static';
    this.cursor = 'pointer';
  }

  /**
   * setState
   */
  public setState(state: CellState) {
    this.state = state;
    this.nextState = state;
  }

  /**
   * queueState
   */
  public queueState(state: CellState) {
    this.nextState = state;
  }

  /**
   * update
   */
  public update() {
    this.setState(this.nextState);
    this._fill.alpha = this.state === 'ALIVE' ? 1 : 0;
  }
}
