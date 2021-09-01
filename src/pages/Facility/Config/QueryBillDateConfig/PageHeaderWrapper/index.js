import React from 'react';
import { FormattedMessage } from 'umi/locale';
import Link from 'umi/link';
import PageHeader from '@/components/PageHeader';
import { connect } from 'dva';
import GridContent from './GridContent';
import styles from './index.less';
import MenuContext from '@/layouts/MenuContext';
import { ConfigProvider } from 'antd';
import CustomizeRenderEmpty from '@/components/MyComponent/CustomizeRenderEmpty';

const PageHeaderWrapper = ({ children, contentWidth, wrapperClassName, top, ...restProps }) => (
  <ConfigProvider renderEmpty={CustomizeRenderEmpty}>
    <div style={{ 'margin': '0px 8px 0 8px' }} className={wrapperClassName}>
      {top}
      <MenuContext.Consumer>
        {value => (
          <PageHeader
            breadcrumbSeparator='>'
            wide={contentWidth === 'Fixed'}
            home={<FormattedMessage id="menu.home" defaultMessage="Home" />}
            {...value}
            key="pageheader"
            {...restProps}
            linkElement={Link}
            hiddenBreadcrumb={true}
            itemRender={item => {
              if (item.locale) {
                return <FormattedMessage id={item.locale} defaultMessage={item.name} />;
              }
              return item.name;
            }}
          />
        )}
      </MenuContext.Consumer>
      {children ? (
        <div className={styles.content}>
          <GridContent>{children}</GridContent>
        </div>
      ) : null}
    </div>
  </ConfigProvider>
);

export default connect(({ setting }) => ({
  contentWidth: setting.contentWidth,
}))(PageHeaderWrapper);
