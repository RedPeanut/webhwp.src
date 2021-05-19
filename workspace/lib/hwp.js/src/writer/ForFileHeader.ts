import {
  write,
  writeFile,
  CFB$Container,
  utils
 } from 'cfb'

import HWPHeader from '../models/header'
import HWPVersion from '../models/version'

class ForFileHeader {

  //// @link https://github.com/hahnlee/hwp.js/blob/master/docs/hwp/5.0/FileHeader.md#%ED%8C%8C%EC%9D%BC-%EC%9D%B8%EC%8B%9D-%EC%A0%95%EB%B3%B4
  //FILE_HEADER_BYTES: number = 256
  //SUPPORTED_VERSION: HWPVersion = new HWPVersion(5, 1, 0, 0)
  //SIGNATURE: string = 'HWP Document File'

  public write(header: HWPHeader, container: CFB$Container): void {
    this.signature()
    this.fileVersion(header.version)
    this.properties(header)
    this.zero216()
  }

  private signature(): void {
    let signature: string = 'HWP Document File';
    ///* this.buffer =  */this.buffer.push(Array.from(...signature))
    //this.buffer.push(Array.from(signature.split('')))
    //this.buffer.push(...Array.from(signature.split('')))
    //let split = signature.split('')
    //split.forEach((item) => { this.buffer.push(item as number) })
    /* for (let i = 0; i < signature.length; i++) {
      this.buffer.push(signature.charAt(i));
    } */
    //utils.cfb_add(container, "Root Entry/", signature)
  }

  private fileVersion(version: HWPVersion) {
    //utils.cfb_add(container, "Root Entry/", version)
  }

  private properties(header: HWPHeader) {
    throw new Error('Method not implemented.')
  }

  private zero216() {
    throw new Error('Method not implemented.')
  }

  //private buffer: ArrayBuffer = new ArrayBuffer(this.FILE_HEADER_BYTES)
  //private buffer: Uint8Array
  //private buffer: [] = []
  private buffer: number[] = []

  constructor(header?: HWPHeader | null, container?: CFB$Container | null) {

  }

}

export default ForFileHeader