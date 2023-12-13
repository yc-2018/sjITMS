import React, { PureComponent } from 'react';
import Link from 'umi/link';
import RightContent from '../GlobalHeader/RightContent';
import BaseMenu from '../SiderMenu/BaseMenu';
import configs from '@/utils/config';
import styles from './index.less';
import { loginOrg } from '@/utils/LoginContext';

export default class TopNavHeader extends PureComponent {
  state = {
    minWidth: undefined,
  };

  componentDidMount() {
    window.addEventListener('resize', this.handleResize.bind(this)); //监听窗口大小改变
  }

  componentWillUnmount() {
    //一定要最后移除监听器，以防多个组件之间导致this的指向紊乱
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  handleResize = e => {
    this.setState({
      minWidth: e.target.innerWidth * 0.7 + 'px',
    });
  };

  // static getDerivedStateFromProps(props) {
  //   console.log(window.innerWidth)
  //   return {
  //     // minWidth: (props.contentWidth === 'Fixed' ? 1200 : window.innerWidth) - 280 - 165 - 40,
  //     minWidth: '100%',
  //   };
  // }

  onMenuSearchChange = open => {
    if (open) {
      this.setState({
        minWidth: document.body.clientWidth * 0.5 + 'px',
      });
    } else {
      this.setState({
        minWidth: document.body.clientWidth * 0.7 + 'px',
      });
    }
  };

  render() {
    const { theme, contentWidth, logo } = this.props;
    const { minWidth } = this.state;
    return (
      <div className={`${styles.head} ${theme === 'light' ? styles.light : styles.dark}`}>
        <div
          ref={ref => {
            this.maim = ref;
          }}
          className={`${styles.main} ${contentWidth === 'Fixed' ? styles.wide : ''}`}
        >
          <div className={styles.left}>
            <div className={styles.logo} key="logo" id="logo">
              <Link to="/bigData/count" className={styles.linkStyle}>
                <img src={logo} alt="logo" />
                <h1>
                  {configs[API_ENV].PRO_ENV == 1
                    ? loginOrg()?.name
                      ? loginOrg().name
                      : '时捷'
                    : loginOrg()?.name
                      ? loginOrg().name
                      : '时捷(测试)'}
                </h1>
              </Link>
            </div>
            <div
              style={{
                width: minWidth ? minWidth : document.body.clientWidth * 0.5 + 'px',
              }}
            >
              <BaseMenu {...this.props} style={{ border: 'none', height: 64 }} />
            </div>
          </div>
          <RightContent {...this.props} onMenuSearchChange={this.onMenuSearchChange} />
        </div>
      </div>
    );
  }
}
