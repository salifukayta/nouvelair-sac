
export class ChatTheme {

  fontName: string;
  fontColor: string;
  backgroundImage: string ;
  takeAllPlace: boolean;
  borderImage: string;
  borderWidth: number;
  borderSlice: string;
  borderRepeat: string;
  isBold: boolean;

  constructor() {
    this.fontName = 'inherit';
    this.fontColor = 'black';
    this.backgroundImage = '';
    this.borderImage = '';
    this.borderWidth = 0;
    this.borderSlice = '';
    this.borderRepeat = '';
    this.isBold = false;
    this.takeAllPlace = false;
    this.backgroundImage = 'assets/default_background.png';
  }

}
