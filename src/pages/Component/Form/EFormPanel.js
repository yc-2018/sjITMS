import React, { PureComponent } from 'react';
import { Collapse } from 'antd';
import styles from '@/pages/Component/Page/inner/Page.less';
import IconFont from '@/components/IconFont';
import panelStyles from './FormPanel.less';

const Panel = Collapse.Panel;

/**
 * 表单信息面板
 * @param {boolean} canCollapse: 是否可收缩
 */
export default class EFormPanel extends PureComponent {

  render() {
    const ori = <div>
      {this.props.title && <div className={panelStyles.titleWrappr}>
        <div className={panelStyles.navTitle}>
          <span>{this.props.title} </span>
        </div>
      </div>}
      {this.props.drawFormRows && this.props.drawFormRows}
      {this.props.drawOther && this.props.drawOther}
    </div>;
    const collapse = <Collapse bordered={false} defaultActiveKey={this.props.isClose ? ['0'] : ['1']}
                               style={{ backgroundColor: 'white' }}
                               expandIcon={({ isActive }) =>
                                 <div className={panelStyles.titleWrappr}>
                                   <div className={panelStyles.navTitle}>
                                     <span>{this.props.title} </span>
                                     {isActive ? <IconFont style={{ fontSize: '16px' }} type="icon-arrow_fold"/> :
                                       <IconFont style={{ fontSize: '16px' }} type="icon-arrow_unfold"/>}
                                   </div>
                                 </div>
                               }>
      <Panel key="1" style={{ 'border': 0 }}>
      {/*<div className={panelStyles.contentWrapper}>*/}
      {this.props.drawFormRows && this.props.drawFormRows}
      {this.props.drawOther && this.props.drawOther}
      {/*</div>*/}
      </Panel>
    </Collapse>;
    return (
      <div className={panelStyles.viewPanelWrapper} style={this.props.style ? this.props.style : null}>
       <div className={panelStyles.collapse}>
         {/*{this.props.title && <div className={panelStyles.titleWrappr}>*/}
         {/*  <div className={panelStyles.navTitle}>*/}
         {/*    <span>{this.props.title} </span>*/}
         {/*  </div>*/}
         {/*</div>}*/}
         {this.props.canCollapse ? collapse : ori }
         {/*<div>*/}
         {/*  {this.props.drawFormRows && this.props.drawFormRows}*/}
         {/*  {this.props.drawOther && this.props.drawOther}*/}
         {/*</div>*/}
         {/*<Collapse bordered={false} defaultActiveKey={this.props.isClose ? ['0'] : ['1']}*/}
         {/*          style={{ backgroundColor: 'white' }}*/}
         {/*          expandIcon={({ isActive }) =>*/}
         {/*            <div className={panelStyles.titleWrappr}>*/}
         {/*              <div className={panelStyles.navTitle}>*/}
         {/*                <span>{this.props.title} </span>*/}
         {/*                {isActive ? <IconFont style={{ fontSize: '16px' }} type="icon-arrow_fold"/> :*/}
         {/*                  <IconFont style={{ fontSize: '16px' }} type="icon-arrow_unfold"/>}*/}
         {/*              </div>*/}
         {/*            </div>*/}
         {/*          }>*/}
         {/*  /!*<Panel key="1" style={{ 'border': 0 }}>*!/*/}
         {/*    /!*<div className={panelStyles.contentWrapper}>*!/*/}
         {/*    {this.props.drawFormRows && this.props.drawFormRows}*/}
         {/*    {this.props.drawOther && this.props.drawOther}*/}
         {/*    /!*</div>*!/*/}
         {/*  /!*</Panel>*!/*/}
         {/*</Collapse>*/}
       </div>
      </div>
    );
  }
}
