// ////////// 货车加载 页面 //////////////////文件创建路径：D:\webCode\iwms-web\src\components\VanLoad\LoadVan.js  由`陈光龙`创建 时间：2024/12/24 下午12:01
import React from 'react';
import styles from './loadVan.less'
import VanLoad from '@/components/VanLoad/index';
/**
 * 刷新页面索引
 * @param props{show,text}
 *
 * @author ChenGuangLong
 * @since 2024/12/24 下午2:13
*/
const LoadVan = ({ show, text }) =>
  <div className={show ? styles.loadVan : styles.hide}>
    <VanLoad/>
    {typeof text === 'string' ? <b>{text}</b> : text}
  </div>
export default LoadVan;
