export default class InputFieldInState {
    constructor (initialState, fieldNameInState, stateComponent) {
        this.fieldNameInStore = fieldNameInState;
        this.storeComponent = stateComponent;
        this._value = initialState.value ? initialState.value : '';
        this._error = initialState.error ? initialState.error : '';
    }

    set value(val) {
        this._value = val;
        let currentObject = this.storeComponent.state[this.fieldNameInStore];
        currentObject.error = '';
        currentObject = Object.assign({}, currentObject, {value: val});
        const toStore = {};
        toStore[this.fieldNameInStore] = currentObject;
        this.storeComponent.setState(toStore);
    }

    get value() {
        return this._value;
    }

    set error(val) {
        this._error = val;
        let currentObject = this.storeComponent.state[this.fieldNameInStore];
        currentObject = Object.assign({}, currentObject, {error: val});
        const toStore = {};
        toStore[this.fieldNameInStore] = currentObject;
        this.storeComponent.setState(toStore);
    }

    get error() {
        return this._error;
    }
}