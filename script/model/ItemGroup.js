import Item from './Item';


class ItemGroup {

    constructor() {
        this._title = null;
        this._items = [];
    }

    get title() {
        return this._title;
    }

    get items() {
        return this._items;
    }

    get itemCnt() {
        return this._items.length;
    }

    get hasItems() {
        return this.itemCnt > 0;
    }

    set title(val) {
        this._title = (val !== undefined) ? val : null;
    }

    toJSON() {
        return {
            title: this._title,
            items: this._items
        }
    }

    static fromJSON(json) {
        if (!json || !('items' in json) || !Array.isArray(json.items)) {
            throw new Error('[ItemGroup] Invalid JSON');
        }

        let obj = new ItemGroup();

        obj.title = json['title'];
        obj._items = [];

        json.items.forEach((i) => {
            obj._items.push(Item.fromJSON(i));
        });

        return obj;
    }
}


export default ItemGroup