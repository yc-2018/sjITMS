import React, { Component, Fragment } from "react";
// import Field from './field';
import {
  Empty,
  Button,
  Row,
  Col,
  Form,
  Select,
  Card,
  Modal
} from "antd";
// import { FormInstance } from 'antd/lib/form';
// import { SearchOutlined } from '@ant-design/icons';
import { IOnlReportItem, ISuperQuery } from "../typings";
import ColsAdvanced from './ColsAdvanced'
const { Option } = Select;

const layout = {
  wrapperCol: { span: 18 },
};
export default class QueryT extends Component{

  // formRef = React.createRef<FormInstance>();
  
  QueryT = Form.create({})(QueryT);
  state = {
    superQueryModalVisible: false
  }

  advanceQuery = () =>{
    this.props.refresh(this.formRef.handleSubmit());
    this.hideModal();
  }


  /**
   * 提交后的事件
   * @param superQuery 
   */
  onFinish = (superQuery) => {
    const {fieldInfos} = this.props;
    // 过滤掉空的查询
    superQuery.queryParams = superQuery.queryParams.filter(item => item.field);
    
    // undefined值转换为空字符
    // TODO 应根据不同类型渲染不同的控件
    superQuery.queryParams = superQuery.queryParams.map(item => ({
       ...item,
        val: item.val === undefined ? "" : item.val,
        type: fieldInfos.find(x => x.fieldName === item.field)?.fieldType
      }));

    // 推送查询条件变化的消息
    this.props.updateData({
      type: "superQuery",
      params: superQuery
    });

    this.hideModal();
  };
  /**
   * 重置
   */
   onReset = () => {
    this.formRef.onReset();
  };
  /**
   * 关闭窗口
   */
  hideModal = () => {
    this.setState({ superQueryModalVisible: false });
  }

  render() {
    const { superQueryModalVisible } = this.state;
    const { fieldInfos,filterValue } = this.props;
    return (
      <Fragment>
        <Button type="primary"  onClick={() => this.setState({ superQueryModalVisible: true })}>
          高级查询
        </Button>
        <Modal title="高级查询构造器"
          onCancel={this.hideModal}
          visible={superQueryModalVisible}
          width={1050}
          footer={[
            <Button key="1" onClick={this.onReset} style={{ float: "left" }}>重置</Button>,
            <Button key="2" style={{ float: "left" }}>保存查询条件</Button>,
            <Button key="3" onClick={this.hideModal}>关闭</Button>,
            <Button key="4" type="primary" onClick={this.advanceQuery}>查询</Button>
          ]}
        >
          <Row>
            <Col span={18}>
             {/*  <AdvancedQuery fieldInfos={fieldInfos} filterValue={filterValue}  refresh={this.props.refresh} hideModal={this.hideModal}/> */}
              <ColsAdvanced 
                formRefs={this.formRef} 
                layout = {layout} 
                onFinish={this.onFinish}
                fieldInfos={fieldInfos}
                filterValue={filterValue} 
                refresh={this.props.refresh}
                hideModal={this.hideModal}
                wrappedComponentRef = {(form)=>this.formRef = form}
                   /> 

            </Col>
            <Col span={6}>
              <Card size="small" title="保存的查询">
                <Empty description={<span style={{ color: "#aeb8c2" }}>没有保存任何查询</span>} />
              </Card>
            </Col>
          </Row>
        </Modal>
      </Fragment>
    );
  }
}
