import React, { Component } from 'react';
import emptySvg from '@/assets/common/img_empoty.svg';
import { formatMessage } from 'umi/locale';

/**
 * 空状态（Empty）
 */
const CustomizeRenderEmpty = () => {
  return(
    <div style={{ textAlign: 'center' }}>
      <img src={emptySvg} />
      <p>{formatMessage({ id: 'common.tips.empty' })}</p>
    </div>
  )
}

export default CustomizeRenderEmpty;