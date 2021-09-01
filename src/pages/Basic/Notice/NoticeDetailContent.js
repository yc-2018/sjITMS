import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styles from './Notice.less';
import openSvg from '@/assets/common/ic_open.svg';
import closeSvg from '@/assets/common/ic_close.svg';
import { noticeLocale } from './NoticeLocale';
import classNames from 'classnames';

export default class NoticeDetailContent extends PureComponent {
  state = {
    isShowMore: false, // 是否显示“显示更多”
    isOpen: false, // 打开还是折叠,
    maxHeight: 200, // 最大高度
    colText: noticeLocale.itemOpen, // 展开折叠显示字符串
  }

  componentDidMount() {
    this.computeView();
  }

  componentWillReceiveProps(nextProps) {
      this.computeView();
  }

  computeView = () => {
    const { maxHeight } = this.state;

    // 获取当前div的高度和宽度
    const { clientWidth, clientHeight } = this.contentRef;
    if (clientHeight >= maxHeight) {
      this.setState({
        isShowMore: true,
      })
    } else {
      this.setState({
        isShowMore: false,
      })
    }
  };

  /**
   * 页面内容展开或者收缩
   */
  showMoreOrLess = () => {
    const { isOpen } = this.state;

    let text = '';
    if (isOpen) {
      text = noticeLocale.itemOpen
    } else {
      text = noticeLocale.itemClose
    }

    this.setState({
      isOpen: !isOpen,
      colText: text,
    })
  }

  handleContent = n => {
    this.contentRef = n;
  };

  computeLinkClsString = () => {
    const { isOpen } = this.state;
    let linkClsString;

    if (isOpen) {
      linkClsString = classNames(styles.link, styles.openLink);
    } else {
      linkClsString = styles.link;
    }
    
    return linkClsString;
  }

  render() {
    const { maxHeight, isShowMore, isOpen, colText } = this.state;
    const { content } = this.props;

    const actualHeight = maxHeight + "px";
    const linkClsString = this.computeLinkClsString();

    return (
      <div className={styles.noticeEllipsisContent}>
        {!isOpen &&
          <div style={{maxHeight: actualHeight}} className={styles.conetnt}>
            <div ref={this.handleContent} dangerouslySetInnerHTML={{ __html:content}}></div>
          </div>
        }
        {isOpen &&
          <div className={styles.conetnt}>
            <div ref={this.handleContent} dangerouslySetInnerHTML={{ __html:content}}></div>
          </div>
        }
        {isShowMore &&
          <div className={linkClsString}>
            <div className={styles.operate}>
              <a onClick={() => this.showMoreOrLess()} style={{ color: '#FF7F5B' }}>{colText}</a>
              <img onClick={() => this.showMoreOrLess()} src={isOpen ? closeSvg : openSvg} />
            </div>
          </div>
        }
      </div>
    )
  }
}