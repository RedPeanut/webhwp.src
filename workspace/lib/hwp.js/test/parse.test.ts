/**
 * Copyright Han Lee <hanlee.dev@gmail.com> and other contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from 'fs'
import * as path from 'path'

import { StreamDirectoryEntry, StorageDirectoryEntry, CompoundFile } from '@webhwp/compound-file-js'
import { inflate } from 'pako'

//import HWPDocument from '../../models/document'
import DocInfo from '../src/models/docInfo'
import HWPHeader from '../src/models/header'
import HWPVersion from '../src/models/version'
import Section from '../src/models/section'
import DocInfoParser from '../src/parser/DocInfoParser'
import SectionParser from '../src/parser/SectionParser'

import { parseFileHeader } from '../src/parser/parse'

describe('parse', () => {

  it('', () => {
    const filePath = path.join(__dirname, 'data', 'blank.hwp')
    const file = fs.readFileSync(filePath)
    const container = CompoundFile.fromUint8Array(new Uint8Array(file.buffer))

    const header = parseFileHeader(container)
    console.log(header.signature)
    console.log(header.version)

  })

  /* it('should parse HWP file', () => {
    const filePath = path.join(__dirname, 'data', 'basicsReport.hwp')
    const file = fs.readFileSync(filePath)

    const container = CompoundFile.fromUint8Array(new Uint8Array(file.buffer))

    const header = parseFileHeader(container)
    console.log(header)
    const docInfo = parseDocInfo(container)
    console.log(docInfo.sectionSize)

    const sections: Section[] = []
    for (let i = 0; i < docInfo.sectionSize; i += 1) {
      sections.push(parseSection(container, i))
    }

    //
  }) */
})

/* const reportFilePath = path.join(__dirname, 'data', 'basicsReport.hwp')
const reportFile = fs.readFileSync(reportFilePath)

describe('parse', () => {
  const hwpDocument = parse(reportFile, { type: 'binary' })

  it('should parse HWP file', () => {
    expect(hwpDocument instanceof HWPDocument).toBe(true)
    expect(hwpDocument.header.version).toEqual(new HWPVersion(5, 0, 2, 4))
  })

  it('should parse collect sectionNumber', () => {
    expect(hwpDocument.info.sectionSize).toEqual(1)
  })

  it('should be collect page size', () => {
    expect(hwpDocument.sections.length).toBe(1)

    // A4 width / height
    expect(hwpDocument.sections[0].width).toBe(59528)
    expect(hwpDocument.sections[0].height).toBe(84188)
  })

  it('should parse signature', () => {
    expect(hwpDocument.header.signature).toBe('HWP Document File')
  })
}) */
