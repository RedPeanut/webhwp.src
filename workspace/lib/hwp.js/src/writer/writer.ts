import {
  write,
  writeFile,
  CFB$Container,
  utils
} from 'cfb'

import HWPDocument from '../models/document'
import ForFileHeader from './ForFileHeader'

class HWPWriter {

  static toFile(document: HWPDocument, filepath: string): void {
    let w: HWPWriter = new HWPWriter(document)
    w.autoSet()
    w.fileHeader()
    w.docInfo()
    w.bodyText()
    w.binData()
    w.writeAndClose(filepath)
  }

  static toStream(document: HWPDocument): ArrayBuffer {
    
    return new ArrayBuffer(0)
  }

  private document: HWPDocument
  private buffer: []
  //private container: CFB$Container

  constructor(document: HWPDocument) {
    this.document = document
    this.buffer = []
    //this.container = utils.cfb_new()
  }

  autoSet(): void {}

  fileHeader(): void {
    //ForFileHeader.write(this.document.header, this.container)
    //new ForFileHeader().write(this.document.header, this.container)
  }

  docInfo(): void {}
  
  bodyText(): void {}

  binData(): void {}

  writeAndClose(filepath: string): void {
    //writeFile(this.container, filepath)
  }
}

export default HWPWriter