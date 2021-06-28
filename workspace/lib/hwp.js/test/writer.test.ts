import fs from 'fs'
import path from 'path'
import { CompoundFile, StorageDirectoryEntry, StreamDirectoryEntry } from '@webhwp/compound-file-js'
import { parseFileHeader } from '../src/parser/parse'
import ForFileHeader from '../src/writer/ForFileHeader'

describe('hwp create test', () => {

  /* it('open blank and print binary', () => {
    const filePath = path.join(__dirname, 'data', 'blank.hwp')
    const file = fs.readFileSync(filePath)
    const container = CompoundFile.fromUint8Array(new Uint8Array(file.buffer))
  }); */

  it('parse header and save', () => {
    
    const srcFilePath = path.join(__dirname, 'data', 'blank.hwp')
    const file = fs.readFileSync(srcFilePath)
    const container = CompoundFile.fromUint8Array(new Uint8Array(file.buffer))
    const header = parseFileHeader(container)

    //constructor
    const compoundFile = new CompoundFile()
    
    //fileHeader()
    const rootStorage = compoundFile.getRootStorage()
    rootStorage.addStorage('FileHeader')
    const storage = rootStorage.findChild(
      (dirEntry) => 'FileHeader' === dirEntry.getDirectoryEntryName()
    ) as StorageDirectoryEntry
    new ForFileHeader(header, storage).write()

    //writeAndClose()
    const bytes: number[] = compoundFile.asBytes()
    const dstFilePath = path.join(__dirname, 'create', 'blank.hwp')
    fs.writeFile(dstFilePath, new Uint8Array(bytes), 'utf8', function(error) {
      console.log('error() is called...')
      console.log('error = ' + error)
    })
  })
});