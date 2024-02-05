// 判断元素是否开始显示了，显示一小部分的不算显示
function isElementInView(element) {
  // 获取元素相对于视口的位置信息
  // x: 元素左侧距离窗口左侧距离，等价于left
  // y: 元素顶部距离窗口顶部距离，等价于top
  // width: 元素宽度
  // height: 元素高度
  // top: 元素顶部距离窗口顶部距离（小于0表示在窗口上方，大于窗口高度表示在窗口下方）
  // bottom: 元素底部距离窗口顶部距离[top+height=bttom]
  // left: 元素左侧距离窗口左侧距离
  // right: 元素有侧距离窗口左侧距离[left+width=right]
  let rect = element.getBoundingClientRect()
  // 窗口高度
  let height = window.innerHeight || document.documentElement.clientHeight
  // 窗口宽度
  let width = window.innerWidth || document.documentElement.clientWidth
  // 设置阻尼，显示一点不算显示
  let enterHeight = Math.min(rect.height / 3, 50)
  let enterWidth = Math.min(rect.width / 3, 80)
  return (
    rect.bottom >= enterHeight &&
    rect.top <= height - enterHeight &&
    rect.right >= enterWidth &&
    rect.left <= width - enterHeight
  )
}

function processAnimation() {
  document.querySelectorAll('body>.module').forEach(moduleElem => {
    let classList = moduleElem.classList
    if (isElementInView(moduleElem)) {
      classList.add('read')
      classList.add('show')
      classList.remove('hide')
    } else {
      classList.remove('show')
      classList.add('hide')
    }
  })
}

!(function () {

  // 当前html加载完执行
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementsByTagName('html')[0].classList.add('loaded')
  })

  // 所有内容加载完执行
  window.addEventListener('load', function () {
    document.getElementsByTagName('html')[0].classList.add('ready')
    processAnimation()
  })

  // 监听滚动
  document.addEventListener('scroll', function () {
    processAnimation()
  })
})()