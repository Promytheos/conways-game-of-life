import { Container } from "pixi.js";
import { Button } from "./button";

export class UI extends Container {
  public readonly startBtn: Button;
  public readonly stopBtn: Button;

  constructor() {
    super();
    this.startBtn = this.addChild(new Button({ text: 'START' }));
    this.stopBtn = this.addChild(new Button({ text: 'STOP' }));

    this.startBtn.position.y = 7;
    this.stopBtn.position.y = this.startBtn.position.y + this.startBtn.height + 10;
    this.startBtn.position.x = 7;
    this.stopBtn.position.x = 7;
  }
}
