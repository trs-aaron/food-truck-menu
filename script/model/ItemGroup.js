import Item from './Item.js';
import ValueField from './ValueField.js';


class ItemGroup {

    constructor() {
        this._index = new ValueField();
        this._title = new ValueField();
        this._items = [];
    }

    get index() {
        return this._index.value;
    }

    get title() {
        return this._title.value;
    }

    get titleModified() {
        return this._title.modified;
    }

    get items() {
        return this._items.map((i) => i);
    }

    get itemCnt() {
        return this._items.length;
    }

    get hasItems() {
        return this.itemCnt > 0;
    }

    get modified() {
        let itemsModifed = this._items.some((i) => i.modified);
        return (itemsModifed || this._index.modified || this._title.modified);
    }

    set initialIndex(val) {
        this._index = new ValueField(val);
    }

    set index(val) {
        this._index.value = (val !== undefined && !isNaN(val)) ? val : null;
    }

    set title(val) {
        this._title.value = (val !== undefined) ? val : null;
    }

    newItem() {
        let item = new Item();
        this._addItem(item);
        return item;
    }

    _addItem(item) {
        if (item) {
            item.initialIndex = this._items.length;
            this._items[item.index] = item;
        }
    }

    toJSON() {
        return {
            title: this._title.value,
            items: this._items
        }
    }

    static fromJSON(json) {
        if (!json || !('items' in json) || !Array.isArray(json.items)) {
            throw new Error('[ItemGroup] Invalid JSON');
        }

        let obj = new ItemGroup();

        obj._title = new ValueField(json['title']);
        obj._items = [];

        json.items.forEach((i) => {
            obj._addItem(Item.fromJSON(i));
        });

        return obj;
    }
}


export default ItemGroup