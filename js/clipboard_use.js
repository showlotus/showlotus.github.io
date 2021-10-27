(function (e, t, a) {
  /*页面载入完成后，创建复制按钮*/
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
        padding: 5px;
        border-radius: 4px;
        background: #333;
        color: #ccc;
        transition: all 0.5s;
        transform: scale(0);
      `
      let x = e.clientX + 30
      let y = e.clientY - 30
      div.style.left = x + 'px'
      div.style.top = y + 'px'
      div.style.transform = 'scale(1)'
      document.body.appendChild(div)
      setTimeout(function () {
        div.style.transform = 'scale(0)'
        setTimeout(function () {
          document.body.removeChild(div)
        }, 500)
      }, 500)
    })
    const clipboard = new ClipboardJS('.btn-copy', {
      target: function (trigger) {
        return trigger.nextElementSibling;
      }
    });
    clipboard.on('success', function (successEvent) {
      return successEvent.clearSelection();
    })
  }
  initCopyCode();
})(window, document);
