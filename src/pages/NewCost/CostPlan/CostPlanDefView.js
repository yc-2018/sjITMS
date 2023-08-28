/*
 * @Author: Liaorongchang
 * @Date: 2023-08-17 09:04:34
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-21 10:32:56
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { commonLocale } from '@/utils/CommonLocale';
import { connect } from 'dva';
import { Button, Input, Modal, message } from 'antd';
import { Fragment } from 'react';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickViewPage';
import { updateNote } from '@/services/cost/CostPlan';

const { TextArea } = Input;

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//View界面扩展
export default class CostPlanView extends QuickViewPage {
  /**
   * state中增加viewStyle会去掉hd默认样式
   * noTitle：去除TabPane的Title
   * card:Pane使用card样式
   * hasOpt：是否显示操作日志
   */

  state = {
    ...this.state,
    isModalOpen: false,
  };

  drawcell = e => {
    const { isModalOpen, entityUuid } = this.state;
    let text;
    if (e.onlFormField.dbFieldName == 'NOTE') {
      const component = {
        label: e.onlFormField.dbFieldTxt,
        value: (
          <span>
            {e.val == undefined ? '<空>' : e.val}
            <a
              style={{ marginLeft: '1rem' }}
              onClick={() => {
                this.setState({ isModalOpen: true });
              }}
            >
              修改
            </a>
            <Modal
              title="备注修改"
              visible={isModalOpen}
              onOk={() => {
                updateNote(entityUuid, text).then(response => {
                  if (response.success) {
                    message.success('修改成功');
                    this.setState({ isModalOpen: false });
                    this.dynamicqueryById();
                  }
                });
              }}
              onCancel={() => {
                this.setState({ isModalOpen: false });
              }}
            >
              <TextArea
                defaultValue={e.val}
                onChange={e => {
                  text = e.target.value;
                }}
              />
            </Modal>
          </span>
        ),
      };
      e.component = component;
    }
  }; //扩展component

  /**
   * 绘制右上角按钮
   */
  drawActionButtion = () => {
    return (
      <Fragment>
        <Button onClick={this.onBack}>{commonLocale.backLocale}</Button>
      </Fragment>
    );
  };
}
