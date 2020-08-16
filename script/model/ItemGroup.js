import Item from './Item.js';
import ValueField from './ValueField.js';


class ItemGroup {

    constructor() {
        this._index = new ValueField();
        this._title = new ValueField();
        this._items = [];
        this._itemsArrayModifed = false;
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
        return this._items.filter(i => !i.isEmpty).length;
    }

    get hasItems() {
        return this.itemCnt > 0;
    }

    get isEmpty() {
        let hasTitle = (this.title && this.title !== '') ? true : false;
        return (!hasTitle && !this.hasItems);
    }

    get modified() {
        let itemsModifed = this._items.some((i) => i.modified);
        return (itemsModifed || this._index.modified || this._title.modified || this._itemsArrayModifed);
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

    isFirstItem(item) {
        return (item.index === 0);
    }

    isLastItem(item) {
        return (item.index >= (this._items.length - 1));
    }

    newItem(index=null) {
        let item = new Item();
        this._addItem(item, index);
        this._onItemsArrayModified();
        return item;
    }

    removeItem(item) {
        this._items.splice(item.index, 1);
        this._onItemsArrayModified();
    }

    moveItemUp(item) {
        if (item.index > 0) {
            let origIndex = item.index;
            let newIndex = origIndex - 1;
            this._items[origIndex] = this._items[newIndex];
            this._items[newIndex] = item;
            this._resetIndexes();
        }
    }

    moveItemDown(item) {
        if (item.index < (this._items.length - 1)) {
            let origIndex = item.index;
            let newIndex = origIndex + 1;
            this._items[origIndex] = this._items[newIndex];
            this._items[newIndex] = item;
            this._resetIndexes();
        }
    }

    setAllItemsAvailable() {
        this._items.forEach((i) => { i.available = true; });
    }

    _addItem(item, index=null) {
        if (item) {
            index = (index && !isNaN(index)) ? index : this._items.length;
            item.initialIndex = index;
            this._items.splice(index, 0, item);
        }
    }

    _resetIndexes() {
        this._items.forEach((item, i) => {
            item.index = i;
        });
    }

    _onItemsArrayModified() {
        this._itemsArrayModified = true;
        this._resetIndexes();
    }

    toJSON() {
        return {
            title: this._title.value,
            items: this._items.filter(i => !i.isEmpty)
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

    static build(title=null) {
        let obj = new ItemGroup();

        obj._title = new ValueField(title);
        obj.newItem();

        return obj;
    }
}


export default ItemGroup