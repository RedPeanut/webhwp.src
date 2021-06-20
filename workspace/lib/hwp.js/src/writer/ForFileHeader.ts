import { CompoundFile, StreamDirectoryEntry } from '@webhwp/compound-file-js'
import HWPHeader from '../models/header'
import HWPVersion from '../models/version'

class ForFileHeader {

  //// @link https://github.com/hahnlee/hwp.js/blob/master/docs/hwp/5.0/FileHeader.md#%ED%8C%8C%EC%9D%BC-%EC%9D%B8%EC%8B%9D-%EC%A0%95%EB%B3%B4
  FILE_HEADER_BYTES: number = 256
  SUPPORTED_VERSION: HWPVersion = new HWPVersion(5, 1, 0, 0)
  //SIGNATURE: string = 'HWP Document File'

  //private buffer: ArrayBuffer = new ArrayBuffer(this.FILE_HEADER_BYTES)
  //private buffer: Uint8Array
  //private buffer: [] = []
  private buffer: number[] = []
  private header: HWPHeader
  //private container: CompoundFile
  private stream: StreamDirectoryEntry
  //private buffer: []

  constructor(header: HWPHeader, stream: StreamDirectoryEntry) {
    this.header = header
    //this.container = container
    this.stream = stream
  }

  public write(): void {
    this.signature()
    this.fileVersion()
    this.properties()
    this.zeroFill(207)
    //this.stream.setStreamData(this.buffer)
  }

  private signature(): void {
    const signature: string = 'HWP Document File'
    for (let i = 0; i < signature.length; i++)
      this.buffer.push(signature.charCodeAt(i))
  }

  private fileVersion(): void {
    this.buffer.push(this.header.version.major)
    this.buffer.push(this.header.version.minor)
    this.buffer.push(this.header.version.build)
    this.buffer.push(this.header.version.revision)
  }

  private properties(): void {
    this.buffer.push(...this.header.properties)
  }

  private zeroFill(length: number): void {
    const arr: number[] = []; arr.length = length; arr.fill(0)
    this.buffer.push(...arr)
  }

}

export default ForFileHeader
