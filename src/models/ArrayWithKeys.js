export class ArrayWithKeys {
    constructor(keyAttr, initialValue = [], onUpdate) {
        this.keyAttr = keyAttr;
        this.keyValues = {};
        if (typeof onUpdate === 'function') {
            this.onUpdate = onUpdate;
        } else {
            this.onUpdate = () => {};
        }
        this.arr = initialValue.map(item => {
            const key = item[this.keyAttr];
            if (!key) {
                throw new Error ('ArrayWithKeys: key must be defined in all elements');
            } else if (this.keyValues[key]) {
                throw new Error ('ArrayWithKeys: keys must be unique for all elements');
            }
            const obj = Object.assign({}, item);
            this.keyValues[key] = obj;
            return obj;
        });

    }

    addItem(item) {
        const key = item[this.keyAttr];
        if (!key) {
            throw new Error ('ArrayWithKeys: key must be defined in all elements');
        } else if (this.keyValues[key]) {
            throw new Error ('ArrayWithKeys: keys must be unique for all elements');
        }
        const obj = Object.assign({}, item);
        this.keyValues[key] = obj;
        this.arr.push(obj);
        this.onUpdate(this.arr);
        return obj;
    }

    getElementByKey(key) {
        return this.keyValues[key];
    }

    getIndexByKey(key) {
        return this.arr.findIndex(item => item[this.keyAttr] === key);
    }

    removeByKey(key) {
        if (this.keyValues[key]) {
            this.arr = this.arr.filter(item => {
                return item[this.keyAttr] !== key;
            })
            delete this.keyValues[key];
            this.onUpdate(this.arr);
            return true;
        }
        return false;
    }

    map(callback) {
        return this.arr.map(callback);
    }

    forEach(callback) {
        return this.arr.forEach(callback);
    }

    get length() {
        return this.arr.length;
    }
}