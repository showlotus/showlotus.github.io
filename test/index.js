function debounce(fn, wait) {
  let timer = null
  return function () {
    const args = arguments
    const _this = this
    if (timer) {
      clearTimeout(timer)
      timer = null
      return
    }
    timer = setTimeout(() => {
      fn.apply(_this, args)
    }, wait)
  }
}

const print = debounce(() => {
  console.log("print")
}, 200)

print()
print()
print()
print()
print()

globalThis.name = "Jack"

function fn() {
  console.log(this.name)
}

fn()
