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

// 原本的异步函数
const request = id => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(id)
    }, 1000)
  })
}

// 可监听是否过期的异步函数
const newRequest = watchExpiredCallback(async function (args, onCleanup) {
  let expired = false
  onCleanup(() => {
    expired = true
  })

  const id = args[0]
  const data = await request(id)
  if (!expired) {
    return data
  } else {
    return Promise.reject("request expired")
  }
})

newRequest(1).then(res => {
  console.log(res)
})
newRequest(2).then(res => {
  console.log(res)
})
newRequest(3).then(res => {
  console.log(res)
})
