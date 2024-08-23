;(function (e, t, a) {
  /* TAG 页面载入完成后，添加跳转链接按钮 */
  var initLinkBtn = function () {
    var wrap = $(".iframe-codepen")
    if (!wrap.length) return
    var src = wrap.attr("src")
    var width = wrap.attr("width")
    var height = wrap.attr("height")
    var editorSrc = src.replace("/full", "/pen")
    var iframe = $("<iframe></iframe>")
      .attr("src", src)
      .attr("width", width)
      .attr("height", height)
    var linkBtn = $(
      `<button class="link-btn"><a href="${editorSrc}" target="_blank" style="color: inherit">在 codepen.io 中查看</a></button>`
    )
    var borderBar = $(`<div class="border-bar"></div>`)
    wrap.append(iframe).append(linkBtn).append(borderBar)
  }
  initLinkBtn()
})(window, document)
