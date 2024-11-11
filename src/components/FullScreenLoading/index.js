// ////////// 全屏加载中 组件 //////////////////文件创建路径：D:\webCode\iwms-web\src\components\FullScreenLoading\index.js  由`陈光龙`创建 时间：2024/11/11 下午2:47
import React from 'react'
import styles from './index.less'

const FullScreenLoading = ({ show }) =>
  <div
    style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      display: show ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      cursor: 'wait',
      zIndex: 9999,
    }}
  >
    <div className={styles.container}>
      <span/>
      <span/>
      <span/>
      <span/>
    </div>
  </div>

export default FullScreenLoading
