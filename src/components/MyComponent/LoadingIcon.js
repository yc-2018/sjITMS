import React, { Component } from 'react';
import { Icon } from 'antd';

/** 加载图标大小 */
const LOADING_SIZE = {
  small: 12,
  default: 24,
  large: 48,
}

/**
 * Loading 图标
 * size取值: {small, default, large}
 */
const LoadingIcon = (size) => {
  return(
    <Icon type="loading" style={{ fontSize: LOADING_SIZE[size] }} spin />
  )
}

export default LoadingIcon;