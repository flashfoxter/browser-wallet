export class ArrayWithKeys {
    constructor(keyAttr, initialValue = []) {
        this.keyAttr = keyAttr;
        this.keyValues = {};
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