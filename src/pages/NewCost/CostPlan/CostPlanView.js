import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Modal, List, Button } from 'antd';
import moment from 'moment';
import { Route, Switch } from 'react-router-dom';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickViewPage';
import { getPlanFile } from '@/services/bms/Cost';

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
    isShow: false,
    downloads: [],
  };

  isShow = item => {
    item = this.entity.cost_plan[0];
    if (item != 'false' && item.ACCESSORY_NAME) {
      let downloadsName = item.ACCESSORY_NAME.split(',');
      let downloads = [];
      downloadsName.map(c => {
        let param = {
          download: c,
          uuid: item.UUID,
        };
        downloads.push(param);
      });
      this.setState({ downloads: downloads });
    } else {
      this.setState({ downloads: [] });
    }

    this.setState({ isShow: !this.state.isShow });
  };

  download = async (item, index) => {
    let parma = {
      uuid: item.uuid,
      index: index,
      fileName: item.download,
    };
    getPlanFile(parma);
  };

  downloadC = e => {
    const { downloads } = this.state;
    let downloadsName = [];
    let item = this.entity.cost_plan[0];
    if (item != 'false' && item.ACCESSORY_NAME) {
      downloadsName = item.ACCESSORY_NAME.split(',');
    }
    return (
      <span>
        <Modal
          title="附件列表"
          visible={this.state.isShow}
          //  onOk={this.handleOk}
          onCancel={() => this.isShow('false')}
          footer={[<Button onClick={() => this.isShow('false')}>返回</Button>]}
        >
          <div style={{ overflow: 'auto', height: '300px' }}>
            <List
              bordered
              dataSource={downloads}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <a onClick={() => this.download(item, index)} key="list-loadmore-edit">
                      下载
                    </a>,
                    // <a key="list-loadmore-more">more</a>,
                  ]}
                >
                  {item.download}
                </List.Item>
              )}
            />
          </div>
        </Modal>
        {/* <a onClick={this.isShow}>查看</a> */}
        <Button type="primary" onClick={this.isShow}>
          查看(
          {downloadsName.length})
        </Button>
      </span>
    );
  };

  drawcell = e => {
    if (e.onlFormField.dbFieldName == 'ACCESSORY_NAME') {
      e.component = {
        label: e.onlFormField.dbFieldTxt,
        value: this.downloadC(e),
      };
    }
  };
}
