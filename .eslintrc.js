module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'prettier', 'plugin:compat/recommended'],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  globals: {
    APP_TYPE: true,
  },
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js'] }],
    'react/jsx-wrap-multilines': 0,
    'react/prop-types': 0,
    'react/forbid-prop-types': 0,
    'react/jsx-one-expression-per-line': 0,
    'import/no-unresolved': [2, { ignore: ['^@/', '^umi/'] }],
    // 'import/no-extraneous-dependencies': [2, { optionalDependencies: true }],
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'linebreak-style': 0,
    'import/extensions': 'off',                       // 忽略文件后缀
    'react/destructuring-assignment': 'off',          // 忽略解构赋值
    'lines-between-class-members': 'off',             // 忽略类成员之间空行
    'react/jsx-tag-spacing': 'off',                   // 忽略jsx标签空格
    'no-unused-expressions': 'off',                   // 忽略未使用的表达式
    'no-return-assign': 'off',                        // 忽略返回赋值
    'no-nested-ternary': 'off',                       // 忽略嵌套三元表达式
    'consistent-return': 'off',                       // 忽略统一的返回值
    'react/no-access-state-in-setstate': 'off',       // 忽略在setState中使用this.state
    'no-param-reassign': 'off',                       // 忽略参数重新赋值
    'prefer-destructuring': 'off',                    // 忽略解构赋值
    'prefer-const': 'off',                            // 忽略常量声明
    'dot-notation': 'warn',                           // 警告点符号
    'import/no-extraneous-dependencies': 'off',       // 忽略外部依赖
    'jsx-a11y/no-noninteractive-tabindex': 'off',     // 忽略tabindex
    'no-undef': 'warn',                               // 警告未定义变量
    'no-plusplus': 'off',                             // 忽略i++
    'no-await-in-loop': 'warn',                       // 警告await循环
    'react/jsx-closing-tag-location': 'off',          // 忽略jsx标签位置
    'compat/compat': 'off',                           // 忽略Object.values()方法不被Opera Mini、IE Mobile 10和IE浏览器支持。
    'import/prefer-default-export': 'off',            // 忽略默认导出
    'no-restricted-syntax':'warn',                    // 警告循环
    'react/no-array-index-key': 'off',                // 忽略数组索引作为key
    'no-continue': 'off',                             // 忽略continue
  },
  settings: {
    polyfills: ['fetch', 'promises', 'url'],
  },
    "parserOptions": {                                // 允许装饰器位置在export前面
        "ecmaFeatures": {
            "legacyDecorators": true
        }
    },
};
