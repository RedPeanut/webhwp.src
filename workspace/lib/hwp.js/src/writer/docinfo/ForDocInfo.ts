import { CompoundFile, StreamDirectoryEntry } from '@webhwp/compound-file-js'
import DocInfo from '../../models/docInfo'
import Section from '../../models/section'

export default class ForDocInfo {

  public static autoset(info: DocInfo, sections: Section[]) {
    //ForDocInfo.documentProperties(info, sections)
    ForDocInfo.idMappings()
  }

  /* private documentProperties() {
    info.sectionSize = sections.length
  } */

  private static idMappings() {
    throw new Error('Function not implemented.')
  }

  private buffer: number[] = []
  private docInfo: DocInfo
  //private compoundFile: CompoundFile
  private stream: StreamDirectoryEntry

  constructor(docInfo: DocInfo, stream: StreamDirectoryEntry) {
    this.docInfo = docInfo
    //this.compoundFile = compoundFile
    this.stream = stream
  }

  public write(): void {
    this.documentProperties()
    this.stream.setStreamData(this.buffer)
  }

  /*
    자료형 길이(바이트) 설명
    UINT16 2 구역 개수
    문서 내 각종 시작번호에 대한 정보
    UINT16 2 페이지 시작 번호
    UINT16 2 각주 시작 번호
    UINT16 2 미주 시작 번호
    UINT16 2 그림 시작 번호
    UINT16 2 표 시작 번호
    UINT16 2 수식 시작 번호
    문서 내 캐럿의 위치 정보
    UINT32 4 리스트 아이디
    UINT32 4 문단 아이디
    UINT32 4 문단 내에서의 글자 단위 위치
    전체 길이 26
  */
  private documentProperties(): void {

  }
}
