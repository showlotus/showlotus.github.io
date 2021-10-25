(function (e, t, a) {
  /*页面载入完成后，创建复制按钮*/
  /* code */
  var initCopyCode = function () {
    var copyHtml = '';
    copyHtml += '<button class="btn-copy" data-clipboard-snippet="">';
    copyHtml += '<span>COPY</span>';
    copyHtml += '</button>';
    $("code.hljs").before(copyHtml);
    $('.btn-copy').click(function (e) {
      let div = document.createElement('div')
      div.innerHTML = '复制成功'
      div.style = `
        position: fixed;
      `
      let x = e.clientX + 20
      let y = e.clientY - 20
      div.style.left = x + 'px'
      div.style.top = y + 'px'
      document.body.appendChild(div)
      let timer = setInterval(function () {
        if (e.clientY - y >= 40) {
          clearInterval(timer)
          document.body.removeChild(div)
        }
        div.style.top = y + 'px'
        y -= 2
      }, 17)
    })
    new ClipboardJS('.btn-copy', {
      target: function (trigger) {
        return trigger.nextElementSibling;
      }
    });
  }
  initCopyCode();
})(window, document);
