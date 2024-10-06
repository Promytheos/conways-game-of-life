import { Container, Graphics } from "pixi.js";

type CellState = 'DEAD' | 'ALIVE';

export class Cell extends Container {
  private _nextState: CellState = 'DEAD';
  private _state: CellState = 'DEAD';

  private readonly _fill: Graphics;
  private readonly _stroke: Graphics;

  constructor(
    public readonly column: number,
    public readonly row: number
  ) {
    super();
    this._stroke = this.addChild(new Graphics());

    this._fill = this.addChild(new Graphics());
    this._fill.alpha = 0;

    this.eventMode = 'static';
    this.cursor = 'pointer';
  }

  /**
   * play
   */
  public play() {
    this.cursor = 'default';
    this.eventMode = 'none';
    this._stroke.visible = false;
  }

  /**
   * stop
   */
  public stop() {
    this.cursor = 'pointer';
    this.eventMode = 'static';
    this._stroke.visible = true;
  }

  /**
   * setState
   */
  private setState(state: CellState) {
    this.state = state;
    this._nextState = state;
  }

  /**
   * queueState
   */
  public queueState(state: CellState) {
    this._nextState = state;
  }

  /**
   * update
   */
  public update() {
    this.setState(this._nextState);
    this._fill.alpha = this.state === 'ALIVE' ? 1 : 0;
  }

  /**
   * resize
   */
  public resize(width: number, height: number) {
    this._stroke.clear()
      .rect(0, 0, width, height)
      .stroke({ width: 1, color: 0x222222 });

    this._fill.clear()
      .rect(0, 0, width, height)
      .fill({ color: 0xffffff });
  }

  /**
   * color
   */
  public color(value: number) {
    const fillWidth = this._fill.width;
    const fillHeight = this._fill.height;
    this._fill.clear()
      .rect(0, 0, fillWidth, fillHeight)
      .fill({ color: value });
  }

  public get state(): CellState {
    return this._state;
  }

  private set state(value: CellState) {
    this._state = value;
  }
}
