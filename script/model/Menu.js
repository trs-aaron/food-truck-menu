import ItemGroup from './ItemGroup.js';
import ValueField from './ValueField.js';
import Item from './Item.js';

class Menu {

    constructor() {
        this._id = new ValueField();
        this._name = new ValueField();
        this._food = null;
        this._other = [];
        this._otherArrayCnt = new ValueField(0);
    }

    get id() {
        return this._id.value;
    }

    get name() {
        return this._name.value;
    }

    get food() {
        return this._food;
    }

    get other() {
        return this._other.map((ig) => ig);
    }

    get otherCnt() {
        return this._other.filter((ig) => !ig.isEmpty).length;
    }

    get modified() {
        let otherItemGroupsModifed = this._other.some((ig) => ig.modified);
        return (otherItemGroupsModifed || this._id.modified || this._name.modified || this._food.modified || this._otherArrayCnt.modified);
    }

    set id(val) {
        this._id.value = (val !== undefined) ? val : null;
    }

    set name(val) {
        this._name.value = (val !== undefined) ? val : null;
    }

    set food(val) {
        this._food = (val && val instanceof ItemGroup) ? val : null;
    }

    isFirstOtherItemGroup(itemGroup) {
        return (itemGroup.index === 0);
    }

    isLastOtherItemGroup(itemGroup) {
        return (itemGroup.index >= (this._other.length - 1));
    }

    newOtherItemGroup(index=null) {
        let group = ItemGroup.build();
        this._addOtherItemGroup(group, index);
        return group;
    }

    removeOtherItemGroup(itemGroup) {
        this._other.splice(itemGroup.index, 1);

        if (this.otherCnt <= 0) {
            this.newOtherItemGroup();
        }

        this._onOtherArrayModified();
    }

    moveOtherItemGroupUp(itemGroup) {
        if (itemGroup.index > 0) {
            let origIndex = itemGroup.index;
            let newIndex = origIndex - 1;
            this._other[origIndex] = this._other[newIndex];
            this._other[newIndex] = itemGroup;
            this._resetIndexes();
        }
    }

    moveOtherItemGroupDown(itemGroup) {
        if (itemGroup.index < (this._other.length - 1)) {
            let origIndex = itemGroup.index;
            let newIndex = origIndex + 1;
            this._other[origIndex] = this._other[newIndex];
            this._other[newIndex] = itemGroup;
            this._resetIndexes();
        }
    }

    setAllItemsAvailable() {
        this._food.setAllItemsAvailable();
        this._other.forEach((ig) => { ig.setAllItemsAvailable(); });
    }


    _addOtherItemGroup(itemGroup, index=null) {
        if (itemGroup) {
            index = (index && !isNaN(index)) ? index : this._other.length;
            itemGroup.initialIndex = index;
            this._other.splice(index, 0, itemGroup);
            this._onOtherArrayModified();
        }
    }

    _resetIndexes() {
        this._other.forEach((group, i) => {
            group.index = i;
        });
    }

    _onOtherArrayModified() {
        this._otherArrayCnt.value = this.otherCnt;
        this._resetIndexes();
    }

    toJSON() {
        return {
            id: this._id.value,
            name: this._name.value,
            food: this._food,
            other: this._other.filter(ig => !ig.isEmpty)
        }
    }

    static fromJSON(json) {
        if (!json || !('id' in json) || !('name' in json) || !('food' in json) || !('other' in json) || !Array.isArray(json.other)) {
            throw new Error('[Item] Invalid JSON');
        }

        let obj = new Menu();

        obj._id = new ValueField(json['id']);
        obj._name = new ValueField(json['name']);
        obj._food = (json['food']) ? ItemGroup.fromJSON(json['food']) : ItemGroup.build();
        obj._other = [];

        json.other.forEach((ig) => {
            obj._addOtherItemGroup(ItemGroup.fromJSON(ig));
        });

        if (obj.otherCnt === 0) {
            obj.newOtherItemGroup();
        }

        obj._otherArrayCnt = new ValueField(obj.otherCnt);

        return obj;
    }

    static build(id, name) {
        let obj = new Menu();

        obj._id = new ValueField(id);
        obj._name = new ValueField(name);
        obj._food = ItemGroup.build();
        obj.newOtherItemGroup();

        return obj;
    }
}


export default Menu;