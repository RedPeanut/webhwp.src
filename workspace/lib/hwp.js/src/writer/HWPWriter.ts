import { CompoundFile } from '@webhwp/compound-file-js'

import HWPDocument from '../models/document'
import ForFileHeader from './ForFileHeader'
import ForDocInfo from './docinfo/ForDocInfo'
import AutoSetter from './autosetter/AutoSetter'

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
  private compoundFile: CompoundFile

  constructor(document: HWPDocument) {
    this.document = document
    this.buffer = []
    this.compoundFile = new CompoundFile()
  }

  autoSet(): void {
    let iid = new InstanceID()
    AutoSetter.autoSet(this.document, iid)
  }

  fileHeader(): void {
    const rootStorage = this.compoundFile.getRootStorage()
    rootStorage.addStorage('FileHeader')
    new ForFileHeader(this.document.header, this.compoundFile).write()
  }

  docInfo(): void {
    const rootStorage = this.compoundFile.getRootStorage()
    rootStorage.addStorage('DocInfo')
    new ForDocInfo(this.document.info, this.compoundFile).write()
  }
  
  bodyText(): void {}

  binData(): void {}

  writeAndClose(filepath: string): void {
    //writeFile(this.container, filepath)
  }
}

export default HWPWriter