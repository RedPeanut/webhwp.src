import {CompoundFile} from "../src/CompoundFile";
import { expect, assert } from "chai";
import {RootStorageDirectoryEntry} from "../src/directory/RootStorageDirectoryEntry";
import fs from "fs";
import {sprintf} from "printj";
import FileSaver from "file-saver";
//var Blob = require('blob');

describe('compound file test', () => {
    /*
    it('create new', () => {
        const compoundFile = new CompoundFile();
        const rootStorage = compoundFile.getRootStorage();
        assert.isNull(rootStorage.getLeftSibling());
        assert.isNull(rootStorage.getRightSibling());
        assert.isNull(rootStorage.getChild());
        expect(rootStorage.getDirectoryEntryName()).eq(RootStorageDirectoryEntry.NAME);
        expect(rootStorage.getDirectoryEntryNameLengthUTF8()).eq(10);
    });

    it('rewrite compound file', () => {
        const compoundFile = new CompoundFile();
        const rootStorage = compoundFile.getRootStorage();
        rootStorage.addStorage("first");
        rootStorage.addStorage("second");
        rootStorage.addStream("stream1", [1,2,3,4]);
        const copy = compoundFile.rewrite();
        assert.isNotNull(copy.getRootStorage().findChild(dirEntry => "first" === dirEntry.getDirectoryEntryName()));
        assert.isNotNull(copy.getRootStorage().findChild(dirEntry => "second" === dirEntry.getDirectoryEntryName()));
        assert.isNotNull(copy.getRootStorage().findChild(dirEntry => "stream1" === dirEntry.getDirectoryEntryName()));
    });

    it('save and the read', () => {
        const compoundFile = new CompoundFile();
        const rootStorage = compoundFile.getRootStorage();
        const storage1 = rootStorage.addStorage("storage1");
        let storage2 = rootStorage.addStorage("storage2");
        rootStorage.addStream("stream1", [1,2,3,4]);
        storage2.addStream("stream2", [1,2,3,4]);
        let storage21 = storage2.addStorage("storage21");
        storage21.addStorage("storage211");
        const copy = CompoundFile.fromBytes(compoundFile.asBytes());
        expect(copy.getRootStorage().storages().length).eq(2);
        assert.isNotNull(copy.getRootStorage().findChild(dirEntry => "storage1" === dirEntry.getDirectoryEntryName()));
        storage2 = copy.getRootStorage().findChild(dirEntry => "storage2" === dirEntry.getDirectoryEntryName());
        assert.isNotNull(storage2);
        expect(storage2.children().length).eq(2);
        storage21 = storage2.findChild(dirEntry => "storage21" === dirEntry.getDirectoryEntryName());
        assert.isNotNull(storage2);
        expect(storage21.children().length).eq(1);
    }); 
    //*/

    /*
    it('read', () => {
        let blob = fs.readFileSync(__dirname+'/data/blank.hwp');
        let container = CompoundFile.fromUint8Array(new Uint8Array(blob.buffer));
        //let container = CompoundFile.fromUint8Array(blob.buffer as Uint8Array);
        //console.log('container = ' + container);
        let children = container.getRootStorage().children();
        for (let i = 0; i < children.length; i++) {
            let entry = children[i];
            console.log(sprintf('entry[%d] = %s', i, entry.getDirectoryEntryName()));
        }
    });

    it('find', () => {
        let blob = fs.readFileSync(__dirname+'/data/blank.hwp');
        let container = CompoundFile.fromUint8Array(new Uint8Array(blob.buffer));
        //console.log('container = ' + container);
        let docInfoEntry = container.getRootStorage().findChild(entry => 'DocInfo' === entry.getDirectoryEntryName());
        console.log('' + docInfoEntry.getDirectoryEntryName());
    });
    //*/

    it('read and save', () => {
        let blob = fs.readFileSync(__dirname+'/data/blank.hwp');
        let container = CompoundFile.fromUint8Array(new Uint8Array(blob.buffer));
        //let blob0 = new Blob(); //Blob is not defined
        //let blob0 = new Blob([],{}); //Blob is not defined
        //let blob1 = new Blob([new Uint8Array(container.asBytes())]); //Blob is not defined
        //let blob2 = new Blob([container.asBytes()]); //Type 'number[]' is not assignable to type 'BlobPart'
        //let blob3 = new Blob(container.asBytes() as BlobPart[]); //Conversion of type 'number[]' to type 'BlobPart[]' may be a mistake
        //FileSaver.saveAs(new Blob([new Uint8Array(container.asBytes())]), __dirname+"/data/blank-saveAs.hwp");
    });
});