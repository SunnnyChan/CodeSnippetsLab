// .vuepress/config.js
module.exports = {
  title: 'Code Snippets Lab',  // 设置网站标题
  description : "",
  base : '/CodeSnippetsLab/',
  themeConfig: {
    nav : [
        { text: 'Github', link: 'http://www.github.com/sunnnychan' }
    ],
    sidebar: [
      {
        title: 'Java',   // 必要的
        path: '/java/',      // 可选的
        collapsable: true, // 可选的, 默认值是 true,
        sidebarDepth: 1,    // 可选的, 默认值是 1
        children: [
          '/java/spring/',
          '/java/log4j/',
          '/java/typecast/',
          '/java/code-inspect/'
        ]
      },
      {
        title: 'Python',   // 必要的
        path: '/python/',      // 可选的
        collapsable: true, // 可选的, 默认值是 true,
        sidebarDepth: 1,    // 可选的, 默认值是 1
      },
      {
        title: 'C',   // 必要的
        path: '/c/',      // 可选的
        collapsable: true, // 可选的, 默认值是 true,
        sidebarDepth: 1,    // 可选的, 默认值是 1
      },
      {
        title: 'Shell',   // 必要的
        path: '/shell/',      // 可选的
        collapsable: true, // 可选的, 默认值是 true,
        sidebarDepth: 1,    // 可选的, 默认值是 1
      },
      {
        title: 'PHP',   // 必要的
        path: '/php/',      // 可选的
        collapsable: true, // 可选的, 默认值是 true,
        sidebarDepth: 1,    // 可选的, 默认值是 1
      }
    ]
  }
}
