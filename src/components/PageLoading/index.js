import React from 'react';
import { Spin } from 'antd';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';

// loading components from code split
// https://umijs.org/plugin/umi-plugin-react.html#dynamicimport
export default () => (
  <div style={{ paddingTop: 100, textAlign: 'center' }}>
    <Spin indicator={LoadingIcon('large')} />
  </div>
);
