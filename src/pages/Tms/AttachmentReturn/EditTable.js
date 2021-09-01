import React, { Component, Fragment } from 'react';
import { Table, Button, Input, InputNumber, message, Popconfirm, Divider, Select } from 'antd';
import isEqual from 'lodash/isEqual';
import { commonLocale, notNullLocale, tooLongLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { itemColWidth } from '@/utils/ColWidth';
import { STATE } from '@/utils/constants';
import { basicState } from '@/utils/BasicState';
import { orgType, getOrgCaption } from '@/utils/OrgType';
import { convertCodeName } from '@/utils/utils';
import QpcStrSelect from '@/pages/Component/Select/QpcStrSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import StoreTypeSelect from '@/pages/Component/Select/StoreTypeSelect';
import { PICK_QPC } from '@/pages/Basic/Article/Constants';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { articleLocale } from '@/pages/Basic/Article/ArticleLocale';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import styles from './EditTable.less';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import AttachmentSelect from '../../Component/Select/AttachmentSelect';
import Empty from '@/pages/Component/Form/Empty';


const Option = Select.Option;

/**
 * 可编辑表格控件
 * 数据源：通过属性value传递
 * 新增行：通过属性addNew方法
 * 保存行：属性onSave 
 * 删除行：属性onRemove
 * 行数据变化：属性onFieldChange
 * 
 */
export default class EditTable extends Component {
  index = 0;

  cacheOriginData = {};

  constructor(props) {
    super(props);

    this.state = {
      data: props.value,
      loading: false,
      value: props.value,
      noAddAndDelete: props.noAddAndDelete,
    };
  }

  componentWillReceiveProps(nextProps){
    if(this.props.value!=nextProps.value){
      this.setState({
        data:nextProps.value
      })
    }
    if(this.props.noAddAndDelete!=nextProps.noAddAndDelete){
      this.setState({
        noAddAndDelete:nextProps.noAddAndDelete
      })
    }
  }

  getRowByKey(key, newData) {
    const { data } = this.state;
    return (newData || data).filter(item => item.key === key)[0];
  }

  toggleEditable = (e, key) => {
    e.preventDefault();
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target };
      }
      target.editable = !target.editable;
      this.setState({ data: newData });
    }
  };

  newMember = () => {
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    let newM = this.props.addNew();
    newM.key = 'NEW_TEMP_ID_' + this.index;
    newM.isNew = true;
    newM.editable = true;
    newData.push(newM);
    this.index += 1;
    this.setState({ data: newData });
  };

  remove(key) {
    const { data } = this.state;
    const { onRemove } = this.props;
    let row = this.getRowByKey(key);
    if (row.isNew) {
      const newData = data.filter(item => item.key !== key);
      this.setState({ data: newData });
      return;
    }

    let that = this;
    if(onRemove){
      onRemove(row)
      .then(result => {
        if (!result.success) {
          result.message && message.error(result.message);
        } else {
          result.message && message.success(result.message);
          const newData = data.filter(item => item.key !== key);
          that.setState({ data: newData });
        }
      })
      .catch(reason => console.error(reason));
    }
  }

  handleKeyPress(e, c, key) {
    if (!c.enterAndSave)
      return;
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }

  handleFieldChange(e, fieldName, key) {
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (this.props.onFieldChange) {
      this.props.onFieldChange(fieldName, e, target);
    }
    this.setState({ data: newData });
  }

  saveRow(e, key) {
    e.persist();
    this.setState({
      loading: true,
    });
    if (this.clickedCancel) {
      this.clickedCancel = false;
      return;
    }
    const target = this.getRowByKey(key) || {};
    let that = this;
    this.props.onSave(target)
      .then(result => {
        if (!result.success) {
          result.message && message.error(result.message);
          e.target.focus();
        } else {
          result.message && message.success(result.message);
          delete target.isNew;
          that.toggleEditable(e, key);
        }
        this.setState({
          loading: false,
        });
      })
      .catch(reason => {
        console.error(reason);
        this.setState({
          loading: false,
        });
      });
  }

  /**
   * 设置某一字段唯一true或者false
   * 
   * @param {String} key 要设置的字段key
   * @param {Boolean} isTrue 是true或者false
   * @param {String} field 要设置的字段名称
   */
  setUnique(key, isTrue, field) {
    const { data } = this.state;
    let row = this.getRowByKey(key);
    if (row) {
      data.map(item => {
        if (item.uuid === row.uuid) {
          item[field] = isTrue
        } else {
          item[field] = !isTrue
        }
      });

      this.setState({
        data: data,
      })
    }
  }

  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      delete this.cacheOriginData[key];
    }
    target.editable = false;
    this.setState({ data: newData });
    this.clickedCancel = false;
  }

  buildComponent = (index, c, text, record) => {
    if (c.componentName === 'InputNumber') {
      if(record.isNew){
        if(c.dataIndex =='returnQtyStr'){
          return <Empty/>;
        }else{
          return (
            <InputNumber
              style={{ width: '100%' }}
              value={text?text:1}
              autoFocus={index === 0}
              onChange={e => this.handleFieldChange(e, c.dataIndex, record.key)}
              onKeyPress={e => this.handleKeyPress(e, c, record.key)}
              placeholder={c.title}
              min={c.min}
              max={c.max}
              precision={0}
            />
          );
        }
      }else{
        if(c.dataIndex =='qtyStr'){
          return text;
        }else{
          return (
            <InputNumber
              style={{ width: '100%' }}
              value={text?text:1}
              autoFocus={index === 0}
              precision={0}
              onChange={e => this.handleFieldChange(e, c.dataIndex, record.key)}
              onKeyPress={e => this.handleKeyPress(e, c, record.key)}
              placeholder={c.title}
              min={c.min}
              max={record.qtyStr}
            />
          );
        }
      }
    } else if (c.componentName === 'AttachmentSelect') {
      if(record.isNew){
        return <AttachmentSelect
          placeholder={placeholderChooseLocale('附件')}
          onChange={e => this.handleFieldChange(e, c.dataIndex, record.key)}
          value={text}
        />
      }else{
        let value = convertCodeName({
          uuid:JSON.parse(text).uuid,
          code:JSON.parse(text).code,
          name:JSON.parse(text).name,
        });
        return value;
      }
    } else {
      let value = text;
      if(JSON.parse(text).type){
        value = convertCodeName({
          uuid:JSON.parse(text).uuid,
          code:JSON.parse(text).code,
          name:JSON.parse(text).name,
        })
      }
      return value;
    }
  }

  buildColumns = () => {

    const columnsData = this.props.columns;
    let columns = [];
    for (let i = 0; i < columnsData.length; i++) {
      let c = columnsData[i];
      columns.push({
        title: c.title,
        dataIndex: c.dataIndex,
        key: c.dataIndex,
        width: c.width,
        render: c.render ?  c.render : (text, record) => {
          
          if (record.editable) {
            return this.buildComponent(i, c, text, record);
          }
          if (text && c.dataIndex === 'pickQpc') {
            return PICK_QPC[text];
          }
          if (text && c.isRenderUCN) {

            let value = JSON.parse(text);
            if(JSON.parse(text).type){
              value = {
                uuid:JSON.parse(text).uuid,
                code:JSON.parse(text).code,
                name:JSON.parse(text).name,
              }
            }

            return <EllipsisCol colValue={convertCodeName(value)} />;
          }

          return text?text:<Empty/>;
        }
      });
    }

    (this.state.editEnable || !this.state.noAddAndDelete) &&
      columns.push(
        {
          title: commonLocale.operateLocale,
          key: 'action',
          width: itemColWidth.operateColWidth,
          render: (text, record) => {
            const { loading } = this.state;
            if (!!record.editable && loading) {
              return null;
            }
            if (record.editable) {
              if (record.isNew) {
                return (
                  <span>
                    <a onClick={e => this.saveRow(e, record.key)}>
                      {commonLocale.saveLocale}
                    </a>
                    <Divider type="vertical" />
                    <IPopconfirm onConfirm={() => this.remove(record.key)}
                      operate={commonLocale.deleteLocale}
                      object={'详情'}
                    >
                      <a>{commonLocale.deleteLocale}</a>
                    </IPopconfirm>
                  </span>
                );
              }
              return (
                <span>
                  <a onClick={e => this.saveRow(e, record.key)}>{commonLocale.saveLocale}</a>
                  <Divider type="vertical" />
                  <a onClick={e => this.cancel(e, record.key)}>{commonLocale.cancelLocale}</a>
                </span>
              );
            }
            return (
              <span>
                {this.props.editEnable &&
                  <a onClick={e => this.toggleEditable(e, record.key)}>{'归还'}</a>
                }
                {!this.state.noAddAndDelete && <Divider type="vertical" />}
                {!this.state.noAddAndDelete &&(
                  !this.props.noDelete&&<IPopconfirm onConfirm={() => this.remove(record.key)}
                      operate={commonLocale.deleteLocale}
                      object={'详情'}
                    >
                      <a>{commonLocale.deleteLocale}</a>
                    </IPopconfirm>
                  )
                }
              </span>
            );
          },
        }
      );

    // 超长省略
    columns.forEach(e => {
      if (e.width) {
        e.onCell = () => {
          return {
            style: {
              maxWidth: e.width,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        }
      }
    });
    return columns;
  }

  render() {
    const { loading, data,noAddAndDelete } = this.state;
    const tableLoading = {
      spinning: loading,
      indicator: LoadingIcon('default')
    }
    return (
      <Fragment>
        <Table
          rowKey={record => record.uuid?record.uuid:record.key}
          loading={tableLoading}
          columns={this.buildColumns()}
          dataSource={data}
          pagination={false}
          rowClassName={record => (record.editable ? styles.editable : '')}
        />
        {
          !this.state.noAddAndDelete && (
            <Button
              style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
              type="dashed"
              onClick={this.newMember}
              icon="plus">
              {commonLocale.addLocale}
            </Button>
          )
        }
      </Fragment>
    );
  }
}
