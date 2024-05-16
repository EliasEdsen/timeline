class Constructor {
  property(prop, desc) {
    Object.defineProperty(this, prop, desc)
    // configurable == false # можно удалить через delete
    // enumerable   == false # отображение в Object.keys()
    // writable     == false # может меняться с помощью приисваивания
    // value        == undefined
    // set          == undefined
    // get          == undefined
  }

  propertyAll(obj, prop, desc) {
    Object.defineProperty(obj, prop, desc)
  }

  set(key, curr, obj = this) { obj[key] = curr; }
}

module.exports = Constructor
