import { FlowDisplayColumn, FlowObjectData, FlowObjectDataArray } from "flow-component-model";

export class GenericDB {

    db: IDBDatabase;
    fields: Map<string,FlowDisplayColumn>;

    static async newInstance (ComponentId: string, fields: Map<string,FlowDisplayColumn>) : Promise<GenericDB>{
        let db: GenericDB = new GenericDB();
        db.fields = fields;

        let op = await new Promise((resolve) => {
            let request: IDBOpenDBRequest = window.indexedDB.open("DB_" + ComponentId, 1);

            request.onerror = (event:any) => {
                console.error("Why didn't you allow my web app to use IndexedDB?!");
                resolve("error");
            };
            request.onsuccess = (event:any) => {
                db.db = event.target.result;
                resolve(db);
            };
            request.onupgradeneeded = (event:any) => {db.upgradeNeeded(event, db);};
        }); 
        return db;
    }

    requestError(event: any, db: GenericDB) {
        console.error("Why didn't you allow my web app to use IndexedDB?!");
    }

    requestSuccess(event: any, db: GenericDB) {
        db.db = event.target.result;
    }

    upgradeNeeded(event: any, db: GenericDB) {
        let database: IDBDatabase = event.target.result;
        //delete all old stores
        for(let pos = 0 ; pos < database.objectStoreNames.length ; pos++) {
            database.deleteObjectStore(database.objectStoreNames.item(pos));
        }
        //create new store
        let store : IDBObjectStore =  database.createObjectStore("rows", { keyPath: "id" });
        db.fields.forEach((fld: FlowDisplayColumn) => {
            store.createIndex(fld.developerName,fld.developerName)
        });
    }

    ingestObjectDataArray(data: FlowObjectDataArray){
        const tx = this.db.transaction("rows", "readwrite");
        const store = tx.objectStore("rows");
        data.items.forEach((item: FlowObjectData) => {
            let ob: any = {};
            ob.id = item.internalId;
            this.fields.forEach((fld: FlowDisplayColumn) => {
                ob[fld.developerName] = item.properties[fld.developerName]?.value;
            });
            store.put(ob);
        });
    }
}