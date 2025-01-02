import { Container, Graphics, Text } from "pixi.js";
import { unwrap } from "./utils";

export interface ButtonConfig {
  text?: string,
  width?: number,
  height?: number,
  bgFill?: string,
  textFill?: string,
  fontSize?: number,
  fontFamily?: string,
  textAlign?: 'left' | 'mid' | 'right',
  textVerticalAlign?: 'bot' | 'mid' | 'top',
  onClick?: () => void,
}

export class Button extends Container {
  private _textField: Text;
  private _text: string;
  private _bg: Graphics;

  constructor(buttonConfig?: ButtonConfig) {
    super();
    const {
      text = '',
      width = 100,
      height = 30,
      bgFill = '#ffffff',
      textFill = '#000000',
      fontSize = 16,
      fontFamily = 'Arial',
      textAlign = 'mid',
      textVerticalAlign = 'mid',
      onClick = () => console.log('I have been clicked!')
    } = unwrap(buttonConfig);

    this._bg = new Graphics().roundRect(0, 0, width, height, 7).fill({ color: bgFill });
    this.addChild(this._bg);

    this._text = text;
    this._textField = this.addChild(
      new Text({
        text: this.text,
        style: {
          fontSize,
          fontFamily,
          fill: textFill,
          align: 'center'
        }
      })
    );

    switch (textAlign) {
      case 'left':
        this._textField.x = 0
        break;
      case 'mid':
        this._textField.x = width / 2 - this._textField.width / 2;
        break;
      case 'right':
        this._textField.x = width - this._textField.width;
        break;
    }

    switch (textVerticalAlign) {
      case 'top':
        this._textField.y = 0
        break;
      case 'mid':
        this._textField.y = height / 2 - this._textField.height / 2;
        break;
      case 'bot':
        this._textField.y = height - this._textField.height;
        break;
    }

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', onClick);
  }

  public set text(value: string) {
    this._text = value;
    this._textField.text = this.text;
  }


  public get text(): string {
    return this._text;
  }

  public enable() {
    this.eventMode = 'static';
    this.cursor = 'pointer';
  }

  public disable() {
    this.cursor = 'default';
    this.eventMode = 'none';
  }

}
