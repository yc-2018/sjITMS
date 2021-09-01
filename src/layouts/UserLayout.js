import React, { Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import Link from 'umi/link';
import { Icon } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';
import SelectLang from '@/components/SelectLang';
import styles from './UserLayout.less';
import logo from '../assets/logo.svg';
import DocumentTitle from 'react-document-title';

const links = [
  {
    key: 'help',
    title: formatMessage({ id: 'layout.user.link.help' }),
    href: '',
  },
  {
    key: 'privacy',
    title: formatMessage({ id: 'layout.user.link.privacy' }),
    href: '',
  },
  {
    key: 'terms',
    title: formatMessage({ id: 'layout.user.link.terms' }),
    href: '',
  },
];

const copyright = (
  <Fragment>
    Copyright <Icon type="copyright" /> {new Date().getFullYear()} 海鼎信息工程股份有限公司
  </Fragment>
);

class UserLayout extends React.PureComponent {
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = 'HEADING Intelligence WMS';
    if (pathname.indexOf('login') > 0) {
      title = `${formatMessage({ id: 'app.login.title' })} - HEADING Intelligence WMS`;
    } else {
      title = `${formatMessage({ id: 'app.forget.title' })} - HEADING Intelligence WMS`;
    }
    return title;
  }

  render() {
    const { children } = this.props;
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={styles.loginWrapper}>
          <div className={styles.lang}>
            <SelectLang />
          </div>
          <div className={styles.container}>
            <div className={styles.content}>
              {children}
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

export default UserLayout;
