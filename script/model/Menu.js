import ItemGroup from './ItemGroup.js';
import ValueField from './ValueField.js';

class Menu {

    constructor() {
        this._id = new ValueField();
        this._name = new ValueField();
        this._title = new ValueField();
        this._food = null;
        this._other = [];
    }

    get id() {
        return this._id.value;
    }

    get name() {
        return this._name.value;
    }

    get title() {
        return this._title.value;
    }

    get food() {
        return this._food;
    }

    get other() {
        return this._other.map((ig) => ig);
    }

    get otherCnt() {
        return this._other.length;
    }

    get modified() {
        let otherItemGroupsModifed = this._other.some((ig) => ig.modified);
        return (otherItemGroupsModifed || this._id.modified || this._name.modified || this._title.modified || this._food.modified);
    }

    set id(val) {
        this._id.value = (val !== undefined) ? val : null;
    }

    set name(val) {
        this._name.value = (val !== undefined) ? val : null;
    }

    set title(val) {
        this._title.value = (val !== undefined) ? val : null;
    }

    set food(val) {
        this._food = (val && val instanceof ItemGroup) ? val : null;
    }

    _addOtherItemGroup(itemGroup) {
        if (itemGroup) {
            itemGroup.initialIndex = this._other.length;
            this._other[itemGroup.index] = itemGroup;
        }
    }

    toJSON() {
        return {
            id: this._id.value,
            name: this._name.value,
            title: this._title.value,
            food: this._food,
            other: this._other
        }
    }

    static fromJSON(json) {
        if (!json || !('id' in json) || !('name' in json) || !('title' in json) || !('food' in json) || !('other' in json) || !Array.isArray(json.other)) {
            throw new Error('[Item] Invalid JSON');
        }

        let obj = new Menu();

        obj._id = new ValueField(json['id']);
        obj._name = new ValueField(json['name']);
        obj._title = new ValueField(json['title']);
        obj._food = (json['food']) ? ItemGroup.fromJSON(json['food']) : null;
        obj._other = [];

        json.other.forEach((ig) => {
            obj._addOtherItemGroup(ItemGroup.fromJSON(ig));
        });

        return obj;
    }
}


export default Menu;