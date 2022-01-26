import { Form, Input,Row,Col,Select,TreeSelect,Icon, Button } from 'antd';
import React from 'react';
import SFormItem from '@/pages/Component/Form/SFormItem';
import 'antd/dist/antd.css';
let id = 0;
@Form.create()
export default class ColsAdvanced extends React.Component {
  treeDate = [];
  constructor(props) {
    super(props);
    this.state = {
    //   toggle: false,
    }
    this.treeData = this.generateTreeData(props.fieldInfos);
  }
    /**
     * 生成TreeSelect所需的data格式
     * @param fieldInfos 
     */
     generateTreeData = (fieldInfos) => {
      return fieldInfos?.map((item) => {
        return {
          title: item.title,
          value: item.key.toUpperCase()
        }
      })
    }

onReset = () => {
  this.props.refresh();
  this.props.hideModal();
}

onSearch = (data) => {
  console.log(this.props)
  data.owner = data.owner ? JSON.parse(data.owner) : undefined;
  data.ownerUuid = data.owner ? data.owner.uuid : undefined;
  this.props.refresh(data);
  this.props.hideModal();
}
  remove = k => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  };
componentDidMount(){
  this.add();
}
  add = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(id++);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    });
  };
  onReset = () =>{
    this.props.form.resetFields();
    this.add();
  }
  handleSubmit = () => {
   const IQueryParam = {};
   const{matchType,field,rule,val} = this.props.form.getFieldsValue();
   const{fieldInfos} = this.props;
   IQueryParam.matchType =  matchType;
   IQueryParam.queryParams = [];
   if(field!=undefined ){
    field.map((item,index)=>{
      if(item!=undefined && rule[index]!=undefined){
        const data = {};
        data.type = fieldInfos.find(x => x.fieldName === item.field)?.fieldType;
        data.field = item;
        data.rule = rule[index];
        data.val = val[index];
        IQueryParam.queryParams.push(data);
      }
    })
    return IQueryParam
   }
   return undefined;
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { filterValue } = this.props;
    console.log("props",this.props);
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };
    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
   
    const formItems = keys.map((k, index) => (
      <Row gutter={16} key = {k}  style={{marginBottom:"3px"}}>
      <Col span={9}>
      <SFormItem key={[{k},"field"]} label={''}  >
            {getFieldDecorator(`field[${k}]`, {
                        })(<TreeSelect
                                {...this.props}
                                showSearch
                                dropdownStyle={{
                                    maxHeight: 400,
                                    maxWidth: 500,
                                    overflow: "auto",
                                }}
                                placeholder="选择查询字段"
                                allowClear
                                treeDefaultExpandAll
                                treeData={this.treeData}
                            />)
                  }
             
          </SFormItem>
      </Col>
      <Col span={4}>   
          <SFormItem key={[{k},"rule"]} label={''}  >
          {getFieldDecorator(`rule[${k}]`, {
                                
                              })(<Select {...this.props}>
                                <Option value="eq">等于</Option>
                                <Option value="like">包含</Option>
                                <Option value="likeRight">以...开始</Option>
                                <Option value="likeLeft">以...结尾</Option>
                                <Option value="between">在...中</Option>
                                <Option value="ne">不等于</Option>
                                <Option value="gt">大于</Option>
                                <Option value="ge">大于等于</Option>
                                <Option value="lt">小于</Option>
                                <Option value="le">小于等于</Option>
                        </Select>)
                      
                              }
          </SFormItem>     
      </Col>
      <Col span={9}>
          <SFormItem key={[{k},"val"]} label={''} >
          {getFieldDecorator(`val[${k}]`, {initialValue:""})(<Input {...this.props} placeholder="请输入值" />)}
          </SFormItem >  
      </Col>
      <Col span={1}>
      {keys.length > 1 ? (
          <Icon
            className="dynamic-delete-button"
            type="minus-circle-o"
            onClick={() => this.remove(k)}
          />
        ) : null}
      </Col>
  </Row> 
    ));
    return (
      
       <Form  {...this.props.layout}
       initialValues={{
         "queryParams": [{
           field: null,
           rule: "eq"
         }]
       }}
       onSubmit={this.handleSubmit}
      >
         <div style={{width:"397px"}}>过滤条件匹配:
                <SFormItem key="matchType" label={'过滤条件匹配'} >
                    {getFieldDecorator('matchType', {
                        initialValue: filterValue ? filterValue.matchType : 'and'
                    })(
                        <Select>
                            <Option value="and">AND（所有条件都要求匹配）</Option>
                            <Option value="or">OR（条件中的任意一个匹配）</Option>
                        </Select>
                    )}
                </SFormItem>
            </div> 
            <br></br>
            {formItems}
        <Form.Item {...formItemLayoutWithOutLabel}>
          <Button type="dashed" onClick={this.add} style={{ width: '60%' }}>
            <Icon type="plus" /> 添加
          </Button>
        </Form.Item>
        </Form>   
       
    );
  }
}

