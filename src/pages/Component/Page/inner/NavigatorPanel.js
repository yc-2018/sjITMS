import React, { PureComponent } from 'react';
import styles from './Page.less';
import FullScreenButton from '@/pages/Component/Page/FullScreenButton';
import { Progress } from 'antd';
import IconFont from '@/components/IconFont';

/**
 * 导航条
 *
 * @param {string} title: 标题
 * @param {string} action: 功能组件
 * @param {string} canFullScreen: 是否可全屏
 * @param {string} percent: 导航条显示进度
 */
class NavigatorPanel extends PureComponent {
  render() {
    const { title, action, canFullScreen } = this.props;
    return (
      <div  style={this.props.style ? this.props.style : {}}
            onClick={this.props.onClick}>
        <div className={styles.navigatorPanelWrapper}>
          <div className={this.props.className}>
            <span className={styles.title}>{title}</span>
            {
              this.props.percent && (
                <span>
            <Progress className={styles.progress} format={(percent) => percent + '/100'}
                      percent={parseFloat(this.props.percent)}/>
                  {
                    this.props.percent >= 100 && <IconFont type='status_completed' style={{
                      fontSize: '16px',
                      position: 'relative',
                      top: 2,
                      left: 34,
                    }}/>
                  }
                  {/*<IconFont type='shrink' style={{ fontSize: '16px', color: '#3B77E3' }} onClick={() => this.onClick()}/>*/}
            </span>
              )
            }
            {canFullScreen && <div className={styles.action}>
              <FullScreenButton fullScreenCallback={this.props.fullScreenCallback}/>
            </div>
            }
            {action && <div className={styles.action}>{action}</div>}
          </div>
        </div>
      </div>
    );
  }
}

export default NavigatorPanel;
