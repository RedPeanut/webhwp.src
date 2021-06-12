import ForDocInfo from '../docinfo/ForDocInfo'
import HWPDocument from '../../models/document'
import InstanceID from './InstanceID'

export default class AutoSetter {

  public static autoSet(document: HWPDocument, iid: InstanceID) {
  }

  private static docInfo(document: HWPDocument): void {
    ForDocInfo.autoset(document.info, document.sections)
  }
}
