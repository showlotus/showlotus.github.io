;(function (e, t, a) {
  /* TAG 页面载入完成后，创建复制按钮*/
  let initCopyCode = function () {
    let copyHtml = ""
    copyHtml += '<button class="btn-copy" data-clipboard-snippet="">'
    copyHtml += ""
    copyHtml += "</button>"
    $("code.hljs").before(copyHtml)
    $(".btn-copy").click(function (e) {
      if ($(".copyMessage").length) return (e.returnValue = false)
      let div = document.createElement("div")
      div.className = "copyMessage"
      div.innerHTML = "Copied"
      div.style = `
        position: fixed;
        left: 50%;
        top: 40%;
        padding: 5px;
        border-radius: 4px;
        background: #333;
        color: #ccc;
        transition: opacity 0.5s ease;
        transform: translate(-50%);
        opacity: 1;
      `
      document.body.appendChild(div)
      setTimeout(function () {
        div.style.opacity = 0
        setTimeout(function () {
          document.body.removeChild(div)
        }, 500)
      }, 500)
    })
    const clipboard = new ClipboardJS(".btn-copy", {
      target: function (trigger) {
        return trigger.nextElementSibling
      }
    })
    clipboard.on("success", function (successEvent) {
      return successEvent.clearSelection()
    })
  }
  initCopyCode()
})(window, document)
