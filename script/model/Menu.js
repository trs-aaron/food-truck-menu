import ItemGroup from './ItemGroup';


class Menu {

    constructor() {
        this._id = null;
        this._title = null;
        this._food = null;
        this._other = [];
    }

    get id() {
        return this._id;
    }

    get title() {
        return this._title;
    }

    get food() {
        return this._food;
    }

    get other() {
        return this._other
    }

    get otherCnt() {
        return this._other.length;
    }

    set id(val) {
        this._id = (val !== undefined) ? val : null;
    }

    set title(val) {
        this._title = (val !== undefined) ? val : null;
    }

    set food(val) {
        this._food = (val && val instanceof ItemGroup) ? val : null;
    }

    toJSON() {
        return {
            id: this._id,
            title: this._title,
            food: this._food,
            other: this._other
        }
    }

    static fromJSON(json) {
        if (!json || !('id' in json) || !('title' in json) || !('food' in json) || !('other' in json) || !Array.isArray(json.other)) {
            throw new Error('[Item] Invalid JSON');
        }

        let obj = new Menu();

        obj.id = json['id'];
        obj.title = json['title'];
        obj.food = (json['food']) ? ItemGroup.fromJSON(json['food']) : null;
        obj._other = [];

        json.other.forEach((ig) => {
            obj._other.push(ItemGroup.fromJSON(ig));
        });

        return obj;
    }
}


export default Menu;