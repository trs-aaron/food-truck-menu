class Item {

    constructor() {
        this._title = null;
        this._desc = null;
        this._price = null;
        this._available = true;
    }

    get title() {
        return this._title;
    }

    get description() {
        return this._desc;
    }

    get price() {
        return this._price;
    }

    get isAvailable() {
        return this._available;
    }

    set title(val) {
        this._title = (val !== undefined) ? val : null;
    }

    set description(val) {
        this._desc = (val !== undefined) ? val : null;
    }

    set price(val) {
        this._price = (val !== undefined) ? val : null;
    }

    set isAvailable(val) {
        this._available = !(val === false);
    }

    toJSON() {
        return {
            title: this._title,
            description: this._desc,
            price: this._price,
            available: this._available
        }
    }

    static fromJSON(json) {
        if (!json || !('title' in json) || !('price' in json) || !('available' in json)) {
            throw new Error('[Item] Invalid JSON');
        }

        let obj = new Item();

        obj.title = json['title'];
        obj.description = json['description'];
        obj.price = json['price'];
        obj.available = json['available'];

        return obj;
    }
}


export default Item