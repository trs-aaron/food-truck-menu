import ValueField from './ValueField.js';

class Item {

    constructor() {
        this._index = new ValueField();
        this._title = new ValueField();
        this._desc = new ValueField();
        this._price = new ValueField(0);
        this._available = new ValueField(true);
    }

    get index() {
        return this._index.value;
    }

    get indexModified() {
        return this._index.modified;
    }

    get title() {
        return this._title.value;
    }

    get titleModified() {
        return this._title.modified;
    }

    get description() {
        return this._desc.value;
    }

    get descriptionModified() {
        return this._desc.modified;
    }

    get price() {
        return this._price.value;
    }

    get priceModified() {
        return this._price.modified;
    }

    get available() {
        return this._available.value;
    }

    get availableModified() {
        return this._available.modified;
    }

    get modified() {
        return (this._index.modified || this._title.modified || this._desc.modified || this._price.modified || this._available.modified);
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

    set description(val) {
        this._desc.value = (val !== undefined) ? val : null;
    }

    set price(val) {
        this._price.value = (val !== undefined) ? parseFloat(val) : null;
    }

    set isAvailable(val) {
        this._available.value = !(val === false);
    }

    toJSON() {
        return {
            title: this._title.value,
            description: this._desc.value,
            price: this._price.value,
            available: this._available.value
        }
    }

    static fromJSON(json) {
        if (!json || !('title' in json) || !('price' in json) || !('available' in json)) {
            throw new Error('[Item] Invalid JSON');
        }

        let obj = new Item();

        obj._title = new ValueField(json['title']);
        obj._desc = new ValueField(json['description']);
        obj._price = new ValueField(json['price']);
        obj._available = new ValueField(json['available']);

        return obj;
    }
}


export default Item