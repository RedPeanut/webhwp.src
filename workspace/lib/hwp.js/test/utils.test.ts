import CFB from 'cfb'
import fs from 'fs'
import path from 'path'

describe('utils', () => {
  it('ArrayBuffer+DataView', () => {
    const buffer = new ArrayBuffer(32)
    const uint8 = new Uint8Array(buffer)
    const int32 = new Int32Array(buffer)
    const uint8By16 = new Uint8Array(buffer, 16)
    const int8By16To16 = new Int8Array(buffer, 16, 16)
  })

  it('cfb is too complicated', () => {
    const newcfb = CFB.utils.cfb_new()
    CFB.utils.cfb_add(newcfb, 'FileHeader', {})
    console.log(`newcfb = ${newcfb}`)
  })
})
