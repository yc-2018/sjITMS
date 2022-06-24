import React, { Fragment } from 'react';
import { Layout, Icon } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';

const { Footer } = Layout;
const FooterView = () => (
  <Footer style={{ padding: 0, background: '#EDF1F5', overflow: 'hidden' }}>
    <GlobalFooter
      copyright={
        <Fragment>
          Copyright <Icon type="copyright" /> {new Date().getFullYear()} 广东时捷物流有限公司
        </Fragment>
      }
    />
  </Footer>
);
export default FooterView;
