import React, { PureComponent } from 'react';
import IconFont from '@/components/IconFont';
import { getActiveKey } from '@/utils/LoginContext';
import { message } from 'antd';

export default class FullScreenButton extends PureComponent {

  constructor() {
    super();

    this.state = {
      isFullScreen: false,
    };

    const that = this;
    document.addEventListener('fullscreenchange', function() {
      if (!that.isFullScreen()) {
        message.destroy();
        message.config({
          getContainer: () => document.body,
        });
        that.setState({
          isFullScreen: false
        }, () => {
          if (that.props.fullScreenCallback) {
            that.props.fullScreenCallback();
          }
        })
      } else {
        that.setState({
          isFullScreen: true
        }, () => {
          if (that.props.fullScreenCallback) {
            that.props.fullScreenCallback();
          }
        })
      }
    });
    document.addEventListener('webkitfullscreenchange', function() {
      if (!that.isFullScreen()) {
        message.destroy();
        message.config({
          getContainer: () => document.body,
        });
        that.setState({
          isFullScreen: false
        }, () => {
          if (that.props.fullScreenCallback) {
            that.props.fullScreenCallback();
          }
        })
      } else {
        that.setState({
          isFullScreen: true
        }, () => {
          if (that.props.fullScreenCallback) {
            that.props.fullScreenCallback();
          }
        })
      }
    });
    document.addEventListener('mozfullscreenchange', function() {
      if (!that.isFullScreen()) {
        message.destroy();
        message.config({
          getContainer: () => document.body,
        });
        that.setState({
          isFullScreen: false
        }, () => {
          if (that.props.fullScreenCallback) {
            that.props.fullScreenCallback();
          }
        })
      } else {
        that.setState({
          isFullScreen: true
        }, () => {
          if (that.props.fullScreenCallback) {
            that.props.fullScreenCallback();
          }
        })
      }
    });
    document.addEventListener('MSFullscreenChange', function() {
      if (!that.isFullScreen()) {
        message.destroy();
        message.config({
          getContainer: () => document.body,
        });
        that.setState({
          isFullScreen: false
        }, () => {
          if (this.props.fullScreenCallback) {
            this.props.fullScreenCallback();
          }
        })
      } else {
        that.setState({
          isFullScreen: true
        }, () => {
          if (this.props.fullScreenCallback) {
            this.props.fullScreenCallback();
          }
        })
      }
    });
  }

  componentDidUpdate() {
    if (this.props.fullScreenCallback) {
      this.props.fullScreenCallback();
    }
  }

  handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      this.setState({
        isFullScreen: false,
      });
    }
  };

  onClick = () => {
    if (this.isFullScreen()) {
      this.setState({
        isFullScreen: false,
      });
      this.exitFullscreen();
    } else {
      this.setState({
        isFullScreen: true,
      });
      this.sectionRequestFullScreen();
    }
    
  };

  isFullScreen = () => {
    const fullScreen = document.fullscreenElement ||
      document.msFullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement;

    return fullScreen;
  };

  exitFullscreen = () => {
    message.destroy();
    message.config({
      getContainer: () => document.body,
    });
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    this.setState({
      isFullScreen: false,
    });
    if (this.props.fullScreenCallback) {
      this.props.fullScreenCallback();
    }
  };

  /**
   * 部分全屏
   */
  sectionRequestFullScreen = () => {
    var activeDom = document.getElementById(getActiveKey());
    var dom = activeDom.getElementsByClassName('ant-card antd-pro-pages-component-page-inner-page-contentWrapper')[0] ?
      activeDom.getElementsByClassName('ant-card antd-pro-pages-component-page-inner-page-contentWrapper')[0] :
      activeDom.getElementsByClassName('ant-card antd-pro\\pages\\-component\\-page\\inner\\-page-contentWrapper')[0];
    if (!dom) {
      return;
    }
    dom.style.width = '100%';
    dom.style.height = '100%';
    dom.style.overflowY = 'scroll';
    if (dom.requestFullscreen) {
      dom.requestFullscreen();
    } else if (dom.mozRequestFullScreen) {
      dom.mozRequestFullScreen();
    } else if (dom.webkitRequestFullScreen) {
      dom.webkitRequestFullScreen();
    } else if (dom.msRequestFullscreen) {
      dom.msRequestFullscreen();
    }

    message.destroy();
    message.config({
      getContainer: () => dom,
    });
    if (this.props.fullScreenCallback) {
      this.props.fullScreenCallback();
    }
  };

  render() {
    return (
      this.state.isFullScreen ?
        <IconFont type='shrink' style={{ fontSize: '16px', color: '#3B77E3' }} onClick={() => this.onClick()}/>
        :
        <IconFont type='icon-fullscreen' style={{ fontSize: '16px', color: '#3B77E3' }} onClick={() => this.onClick()}/>
    );
  }
}
