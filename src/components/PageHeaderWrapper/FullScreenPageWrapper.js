import React from 'react';
import { FormattedMessage } from 'umi/locale';
import Link from 'umi/link';
import PageHeader from '@/components/PageHeader';
import { connect } from 'dva';
import GridContent from './GridContent';
import styles from './index.less';
import MenuContext from '@/layouts/MenuContext';
import { ConfigProvider, Modal } from 'antd';
import CustomizeRenderEmpty from '@/components/MyComponent/CustomizeRenderEmpty';
import { getActiveKey } from '@/utils/LoginContext';
import { render } from 'react-dom';
export function getDom() {
  let activeDom = document.getElementById(getActiveKey());
  let cardDom = activeDom.getElementsByClassName("ant-card-body")[0];
  return cardDom ? cardDom : activeDom;
}
const PageHeaderWrapper = ({ children, contentWidth, wrapperClassName, top, ...restProps }) => (
  <ConfigProvider renderEmpty={CustomizeRenderEmpty}
    getPopupContainer={() => getDom()}
    getCalendarContainer={() => getDom()}
    getContainer={() => getDom()}
  >
    <div style={{ margin: '-24px 8px 0' }} className={wrapperClassName}>
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
