import { FlushValues } from 'pako'

class ByteWriter {

  private view: DataView
  private byteOffset: number = 0

  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer)
  }

  writeUInt32(value: number): void {
    this.view.setUint32(this.byteOffset, value)
    this.byteOffset += 4
  }

  writeInt32(value: number): void {
    this.view.setInt32(this.byteOffset, value)
    this.byteOffset += 4
  }

  writeUInt16(value: number): void {
    this.view.setUint16(this.byteOffset, value)
    this.byteOffset += 2
  }

  writeInt16(value: number): void {
    this.view.setUint16(this.byteOffset, value)
    this.byteOffset += 2
  }

  writeUInt8(value: number): void {
    this.view.setUint8(this.byteOffset, value)
    this.byteOffset += 1
  }

  writeInt8(value: number): void {
    this.view.setInt8(this.byteOffset, value)
    this.byteOffset += 1
  }

  writerBytes(value: [], count?: number): void {
    count = count || value.length
    for (let i = 0; i < count; i++) {
      this.view.setUint8(this.byteOffset, value[i])
      this.byteOffset += 1
    }
    if (value.length < count)
      this.writeZero(count - value.length)
  }

  writeZero(count: number): void {
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        this.view.setUint8(this.byteOffset, 0)
        this.byteOffset += 1
      }
    }
  }
}

export default ByteWriter
