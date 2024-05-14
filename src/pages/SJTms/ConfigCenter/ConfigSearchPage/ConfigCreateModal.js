import React, { PureComponent } from 'react';
import { Form, Input, Modal, Select, Row, Col, message, Button, Tooltip } from 'antd';
import { loginCompany } from '@/utils/LoginContext';
import { commonLocale, notNullLocale } from '@/utils/CommonLocale';
const FormItem = Form.Item;
const { TextArea } = Input;

function transitionJsonToString(jsonObj) {
  // 转换后的jsonObj受体对象
  // let _jsonObj: any = null; // ts写法
  let _jsonObj = null;
  // 判断传入的jsonObj对象是不是字符串，如果是字符串需要先转换为对象，再转换为字符串，这样做是为了保证转换后的字符串为双引号
  if (Object.prototype.toString.call(jsonObj) !== '[object String]') {
    try {
      _jsonObj = JSON.stringify(jsonObj);
    } catch (error) {
      // 转换失败错误信息
      // callback(error);
      message.error('转换失败，请检查json格式是否正确！' + error);
      return jsonObj;
    }
  } else {
    try {
      jsonObj = jsonObj.replace(/(\')/g, '"');
      _jsonObj = JSON.stringify(JSON.parse(jsonObj));
    } catch (error) {
      // 转换失败错误信息
      // callback(error);
      message.error('转换失败，请检查json格式是否正确！' + error);
      return jsonObj;
    }
  }
  return _jsonObj;
}

function formatJson(jsonObj) {
  //  console.log(jsonObj)
  //  console.log(callback)
  // 正则表达式匹配规则变量
  let reg = null;
  // 转换后的字符串变量
  let formatted = '';
  // 换行缩进位数
  let pad = 0;
  // 一个tab对应空格位数
  let PADDING = '\t';
  // json对象转换为字符串变量
  let jsonString = transitionJsonToString(jsonObj);
  if (!jsonString) {
    message.error('转换失败，请检查json格式是否正确！');
    return jsonString;
  }
  // 存储需要特殊处理的字符串段
  let _index = [];
  // 存储需要特殊处理的“再数组中的开始位置变量索引
  let _indexStart = null;
  // 存储需要特殊处理的“再数组中的结束位置变量索引
  let _indexEnd = null;
  // 将jsonString字符串内容通过\r\n符分割成数组
  let jsonArray = [];
  // 正则匹配到{,}符号则在两边添加回车换行
  jsonString = jsonString.replace(/([\{\}])/g, '\r\n$1\r\n');
  // 正则匹配到[,]符号则在两边添加回车换行
  jsonString = jsonString.replace(/([\[\]])/g, '\r\n$1\r\n');
  // 正则匹配到,符号则在两边添加回车换行
  jsonString = jsonString.replace(/(\,)/g, '$1\r\n');
  // 正则匹配到要超过一行的换行需要改为一行
  jsonString = jsonString.replace(/(\r\n\r\n)/g, '\r\n');
  // 正则匹配到单独处于一行的,符号时需要去掉换行，将,置于同行
  jsonString = jsonString.replace(/\r\n\,/g, ',');
  // 特殊处理双引号中的内容
  jsonArray = jsonString.split('\r\n');
  jsonArray.forEach(function (node, index) {
    // 获取当前字符串段中"的数量
    let num = node.match(/\"/g) ? node.match(/\"/g).length : 0;
    // 判断num是否为奇数来确定是否需要特殊处理
    if (num % 2 && !_indexStart) {
      _indexStart = index;
    }
    if (num % 2 && _indexStart && _indexStart != index) {
      _indexEnd = index;
    }
    // 将需要特殊处理的字符串段的其实位置和结束位置信息存入，并对应重置开始时和结束变量
    if (_indexStart && _indexEnd) {
      _index.push({
        start: _indexStart,
        end: _indexEnd,
      });
      _indexStart = null;
      _indexEnd = null;
    }
  });
  // 开始处理双引号中的内容，将多余的"去除
  _index.reverse().forEach(function (item, index) {
    let newArray = jsonArray.slice(item.start, item.end + 1);
    jsonArray.splice(item.start, item.end + 1 - item.start, newArray.join(''));
  });
  // 将处理后的数组通过\r\n连接符重组为字符串
  jsonString = jsonArray.join('\r\n');
  // 将匹配到:后为回车换行加大括号替换为冒号加大括号
  jsonString = jsonString.replace(/\:\r\n\{/g, ':{');
  // 将匹配到:后为回车换行加中括号替换为冒号加中括号
  jsonString = jsonString.replace(/\:\r\n\[/g, ':[');
  // 将上述转换后的字符串再次以\r\n分割成数组
  jsonArray = jsonString.split('\r\n');
  // 将转换完成的字符串根据PADDING值来组合成最终的形态
  jsonArray.forEach(function (item, index) {
    // console.log(item);
    let i = 0;
    // 表示缩进的位数，以tab作为计数单位
    let indent = 0;
    // 表示缩进的位数，以空格作为计数单位
    let padding = '';
    if (item.match(/\{$/) || item.match(/\[$/)) {
      // 匹配到以{和[结尾的时候indent加1
      indent += 1;
    } else if (item.match(/\}$/) || item.match(/\]$/) || item.match(/\},$/) || item.match(/\],$/)) {
      // 匹配到以}和]结尾的时候indent减1
      if (pad !== 0) {
        pad -= 1;
      }
    } else {
      indent = 0;
    }
    for (i = 0; i < pad; i++) {
      padding += PADDING;
    }
    formatted += padding + item + '\r\n';
    pad += indent;
  });
  // 返回的数据需要去除两边的空格和换行
  return formatted.trim().replace(new RegExp('^\\' + '<br />' + '+|\\' + '<br />' + '+$', 'g'), '');
}

@Form.create()
export default class DispatcherConfigCreateModal extends PureComponent {
  state = {
    ...this.state,
    exVisible: false,
    selectKeyEn: '',
    exValue: this.props.exValue ? this.props.exValue : {},
    value: '',
  };
  okHandle = () => {
    const { form, contentProps, isEdit, isCopy } = this.props;

    form.validateFields(errors => {
      if (errors) return;
      const { exValue } = this.state;
      let formObj = form.getFieldsValue();
      let saveEntityList = [];
      let dispatchcenteruuid = formObj.dispatchcenter.split(',')[0];
      let dispatchcentername = formObj.dispatchcenter.split(',')[1];
      for (let key in formObj) {
        if (key == 'dispatchcenter') continue;
        let param = {
          ...contentProps,
          companyuuid: loginCompany().uuid,
          dispatchcenteruuid: dispatchcenteruuid,
          dispatchcentername: dispatchcentername,
          keyEn: key,
          value: formObj[key],
          exValue: exValue[key],
        };
        saveEntityList.push(param);
      }
      this.props.handleSave({
        configNameEn: contentProps.configNameEn,
        dispatchcenteruuid: dispatchcenteruuid,
        isEdit: isCopy ? false : isEdit,
        body: saveEntityList,
      });
    });
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.exValue != this.state.exValue) {
      this.setState({ exValue: nextProps.exValue });
    }
  }

  handleCancel = () => {
    const { form, handleCreateModalVisible } = this.props;
    form.resetFields();
    handleCreateModalVisible();
  };

  buildOptions = () => {
    const { sourceData } = this.props;
    return sourceData.map(data => {
      return (
        <Select.Option value={`${data.VALUE},${data.NAME}`} label={data.NAME} title={data.NAME}>
          {data.NAME}
        </Select.Option>
      );
    });
  };

  okHandleEx = () => {
    const { selectKeyEn, exValue, value } = this.state;
    exValue[selectKeyEn] = value;
    this.setState({ exValue: exValue, value: '', exVisible: false });
  };

  handleExCancle = () => {
    this.setState({ exVisible: false, selectKeyEn: '', value: '' });
  };

  clickEx = e => {
    const { exValue } = this.state;
    let value = exValue[e] ? exValue[e] : '';
    this.setState({ exVisible: true, selectKeyEn: e, value });
  };

  exInputOnchange = e => {
    this.setState({ value: e.target.value });
  };
  render() {
    const {
      form,
      modalVisible,
      loading,
      contentProps,
      initData,
      isEdit,
      isCopy,
    } = this.props;
    const { exValue, selectKeyEn } = this.state;
    const { columns } = contentProps;
    const { getFieldDecorator } = form;
    const baseFormItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    let initDispatchValue = {};
    if (isEdit && !isCopy) {
      initDispatchValue = {
        initialValue: `${initData.dispatchcenteruuid},${initData.dispatchcentername}`,
      };
    }
    return (
      <Modal
        width={columns.length > 10 ? 1200 : 500}
        style={{ top: "50px" }}
        title={isEdit ? (isCopy ? '复制' : commonLocale.editLocale) : commonLocale.addLocale}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.handleCancel}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form {...baseFormItemLayout}>
          <Row>
            <Col span={columns.length > 10 ? 12 : 24}>
              <FormItem label={'调度中心'}>
                {getFieldDecorator('dispatchcenter', {
                  ...initDispatchValue,
                  rules: [{ required: true, message: notNullLocale('调度中心') }],
                })(<Select disabled={isCopy ? false : isEdit}>{this.buildOptions()}</Select>)}
              </FormItem>
            </Col>
          </Row>
          <Row align='center' gutter={10}>
            {columns.map(column => {
              let init = isEdit ? { initialValue: `${initData[column.keyEn]}` } : {};
              return (
                <Col span={columns.length > 10 ? 12 : 24}>
                  <FormItem label={
                    <Tooltip title={column.note }>{column.keyCn}</Tooltip>
                  }>
                    {getFieldDecorator(`${column.keyEn}`, {
                      ...init,
                      rules: [{ required: true, message: notNullLocale(column.keyCn) }],
                    })(
                      <Row>
                        <Col span={20}>
                          <Input defaultValue={initData[column.keyEn]} />
                        </Col>
                        <Col span={4}>
                          <Button
                            style={{
                              marginLeft: '5px',
                              borderColor: exValue[column.keyEn] ? 'red' : '',
                              color: exValue[column.keyEn] ? 'red' : '',
                            }}
                            onClick={() => this.clickEx(column.keyEn)}
                          >
                            Json
                          </Button>
                        </Col>
                      </Row>
                    )}
                  </FormItem>
                </Col>
              );
            })}
          </Row>
        </Form>
        <Modal
          title={selectKeyEn + '额外参数'}
          visible={this.state.exVisible}
          onOk={this.okHandleEx}
          onCancel={this.handleExCancle}
          confirmLoading={loading}
          destroyOnClose
        >
          <Button
            style={{ marginBottom: '10px' }}
            onClick={() => {
              let { value } = this.state;
              value = formatJson(value);
              this.setState({ value });
            }}
          >
            格式化JSON
          </Button>
          <TextArea rows={10} onChange={this.exInputOnchange} value={this.state.value} />
        </Modal>
      </Modal>
    );
  }
}
