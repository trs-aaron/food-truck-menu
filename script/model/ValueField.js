class ValueField {

    constructor (val=null) {
        this._origVal = val;
        this._val = val;
    }

    get value() {
        return this._val;
    }

    set value(val) {
        this._val = val;
    }

    get modified() {
        return (this._val !== this._origVal);
    }
}

export default ValueField;