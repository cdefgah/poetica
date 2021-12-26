import { Directive, HostListener } from '@angular/core';

@Directive({
    selector: '[appBlockCopyPaste]'
  })
  export class BlockCopyPasteDirective {
    // Директива для блокирования возможности копирования/вставки в поле
    // Применение смотри в настройках, в разделе сброса базы.

    constructor() { }

    @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
      e.preventDefault();
    }

    @HostListener('copy', ['$event']) blockCopy(e: KeyboardEvent) {
      e.preventDefault();
    }

    @HostListener('cut', ['$event']) blockCut(e: KeyboardEvent) {
      e.preventDefault();
    }
  }
