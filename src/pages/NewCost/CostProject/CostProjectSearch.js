import React, { PureComponent } from 'react';
import { Button, Modal, List } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { getFile } from '@/services/bms/Cost';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class CostProjectSearch extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = { ...this.state, isShow: false, canDragTable: true, downloads: [] }; // noActionCol: false

  //该方法用于扩展查询
  exSearchFilter = () => {};
  //该方法用于更改State
  changeState = () => {};
  /**
   * 该方法用于自定义扩展列
     e={
       column:column
     }
   */
  drawExColumns = e => {};
  /**
   该方法用于修改table的render

   e的对象结构为{
      column   //对应的column
      record,  //对应的record
      component, //render渲染的组件
      val  //val值
   }  
   */
  drawcell = e => {
    //找到fieldName为CODE这一列 更改它的component
    if (e.column.fieldName == 'ACCESSORY_NAME') {
      // const component = <p3 style={{ color: 'red' }}>{e.val}</p3>;
      let downloadsName = [];
      if (e.record != 'false' && e.record.ACCESSORY_NAME) {
        downloadsName = e.record.ACCESSORY_NAME.split(',');
      }
      const component = (
        <span>
          <Button size="small" onClick={this.isShow.bind(this, e.record)} type="primary">
            查看(
            {downloadsName.length})
          </Button>
        </span>
      );
      e.component = component;
    }
  };

  isShow = item => {
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
    getFile(parma);
  };
  //该方法用于写最上层的按钮 多个按钮用<span>包裹
  drawTopButton = () => {
    const { downloads } = this.state;
    return (
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
    );
  };

  //该方法用于写中间的功能按钮 多个按钮用<span>包裹
  drawToolsButton = () => {};

  //该方法会覆盖所有的上层按钮
  //drawActionButton = () => {};

  //该方法会覆盖所有的中间功能按钮
  //drawToolbarPanel = () => {};

  // 该方法会覆盖所有的搜索查询
  // drawSearchPanel=()=>{}

  //该方法用于拖拽后触发事件 拖拽需要在state中canDragTable: true
  drapTableChange = list => {
    console.log('list', list);
  };
}
