import { CompoundFile } from "@webhwp/compound-file-js";
import DocInfo from "../../models/docInfo";
import Section from "../../models/section";

export default class ForDocInfo {

	public static autoset(info: DocInfo, sections: Section[]) {
		ForDocInfo.documentProperties(info, sections);
		ForDocInfo.idMappings();
	}
	
	private static documentProperties(info: DocInfo, sections: Section[]) {
		info.sectionSize = sections.length;
	}
	
	private static idMappings() {
		throw new Error("Function not implemented.");
	}

	private docInfo: DocInfo;
	private compoundFile: CompoundFile;

	constructor(docInfo: DocInfo, compoundFile: CompoundFile) {
		this.docInfo = docInfo;
		this.compoundFile = compoundFile;
	}

	write() {
		
	}

}
