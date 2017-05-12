function VNode(tag, data, children, text) {
  return {
    tag: tag,
    data: data,
    children: children,
    text: text
  }
}

class Vue {
  constructor(options) {
    this.$options = options
    this._data = options.data
    Object.keys(options.data).forEach(key => this._proxy(key))
    observer(options.data)
    const vdom = watch(this, this._render.bind(this), this._update.bind(this))
    console.log(vdom)
  }
  _proxy(key) {
    const self = this
    Object.defineProperty(self, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter() {
        return self._data[key]
      },
      set: function proxySetter(val) {
        self._data[key] = val
      }
    })
  }
  _update() {
    console.log("我需要更新");
    const vdom = this._render.call(this)
    console.log(vdom);
  }
  _render() {
    return this.$options.render.call(this)
  }
  __h__(tag, attr, children) {
    return VNode(tag, attr, children.map((child) => {
      if (typeof child === 'string') {
        return VNode(undefined, undefined, undefined, child)
      } else {
        return child
      }
    }))
  }
  __toString__(val) {
    return val == null ? '' : typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
  }
}

function observer(obj) {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object') {
      new observer(obj[key])
    }
    defineReactive(obj, key, obj[key])
  })
}

function defineReactive(obj, key, val) {
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: () => {
      if (Dep.target) {
        dep.add(Dep.target)
        Dep.target = null
      }
      console.log('你访问了' + key)
      return val
    },
    set: newVal => {
      if (newVal === val)
        return
      console.log('你设置了' + key)
      console.log('新的' + key + ' = ' + newVal)
      val = newVal
      dep.notify()
    }
  })
}

function watch(vm, exp, cb) {
  Dep.target = cb
  return exp()
}

class Dep {
  constructor() {
    this.subs = []
  }
  add(cb) {
    this.subs.push(cb)
  }
  notify() {
    this.subs.forEach((cb) => cb())
  }
}
Dep.target = null


var demo = new Vue({
  el: '#demo',
  data: {
    text: "before",
    test: {
      a: '1'
    },
    t: 1
  },
  render() {
    return this.__h__('div', {}, [
      this.__h__('span', {}, [this.__toString__(this.text)]),
      this.__h__('span', {}, [this.__toString__(this.test.a)])
    ])
  }
})
