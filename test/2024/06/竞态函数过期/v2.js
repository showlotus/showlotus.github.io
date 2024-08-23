function watchExpiredCallback(callback) {
  let cleanup
  const onCleanup = fn => {
    cleanup = fn
  }
  return function (...args) {
    cleanup?.()
    return callback.apply(this, [args, onCleanup])
  }
}

const request = id => {
  const controller = new AbortController()
  const response = fetch("/", {
    signal: controller.signal
  })
  const cancel = () => controller.abort(`fetch id:(${id}) is canceled.`)
  return { response, cancel }
}

const newRequest = watchExpiredCallback(function (args, onCleanup) {
  const id = args[0]
  const { response, cancel } = request(id)
  onCleanup(cancel)
  return response
})

newRequest(1).then(res => {
  console.log("from 1", res)
})
newRequest(2).then(res => {
  console.log("from 2", res)
})
newRequest(3).then(res => {
  console.log("from 3", res)
})
