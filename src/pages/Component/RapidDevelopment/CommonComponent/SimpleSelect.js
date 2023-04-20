/*
 * @Author: Liaorongchang
 * @Date: 2022-02-10 14:16:00
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-03-22 14:55:01
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Select, Divider, Row, Col, Button, Tooltip } from 'antd';
import { selectCoulumns, dynamicQuery } from '@/services/quick/Quick';
import moment from 'moment';

/**
 * 简易查询下拉选择控件
 *
 * 支持form表单initialValue设置初始值，也可通过属性value设置初始值,形式为JSON.stringify(entity.owner)
 * 支持通过form表单获取控件值，获取到的为货主字符串形式的ucn，可通过JSON.parse(fieldName)转换格式
 * hasAll：包含全部选项，可用于搜索条件;全部选项值为''
 * disabled：是否禁用；multiple：是否多选；onlyOnline：是否只查询启用状态的货主
 */
export default class SimpleSelect extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { sourceData: [] };
  }

  componentDidMount() {
    this.initData();
  }

  componentWillReceiveProps(props) {
    if (props.isOrgQuery !== this.props.isOrgQuery) {
      this.initSearch(props.isOrgQuery);
    }
  }
  initData = async () => {
    let queryParamsJson;
    if (this.props.showSearch) {
      this.initSearch();
      // this.setState({ sourceData: [] });
    } else {
      const { dictCode } = this.props;
      if (dictCode) {
        queryParamsJson = {
          tableName: 'V_SYS_DICT_ITEM',
          condition: {
            params: [{ field: 'DICT_CODE', rule: 'eq', val: [dictCode] }],
          },
        };
        const response = await dynamicQuery(queryParamsJson);
        if (!response || !response.success || !Array.isArray(response.result.records)) {
          this.setSourceData([]);
        } else {
          this.setSourceData(response.result.records);
        }
      }
    }
  };

  initSearch = async e => {
    let params = [];
    let isOrgQuery = e ? e : this.props.isOrgQuery;
    let jsonParam = this.props.searchField?.searchProperties
      ? JSON.parse(this.props.searchField?.searchProperties)
      : undefined;
    if (jsonParam) {
      let dateParam = jsonParam.dateParam;
      let textParam = jsonParam.textParam;
      //time
      if (dateParam) {
        const searchField = this.props.searchField;
        params.push({
          field: searchField.fieldName,
          type: searchField.fieldType,
          rule: 'like',
          val: '',
        });
        for (let key in dateParam) {
          let endDate = moment(new Date())
            .add(1, 'days')
            .format('YYYY-MM-DD');
          let startDate = moment(new Date())
            .add(-dateParam[key], 'days')
            .format('YYYY-MM-DD');
          params.push({
            field: key,
            type: 'Date',
            rule: 'between',
            val: `${startDate}||${endDate}`,
          });
        }
      }
      if (isOrgQuery) {
        params = [...params, ...isOrgQuery];
      } else {
        params = [...params];
      }
      const payload = {
        superQuery: { queryParams: params },
        quickuuid: this.props.reportCode,
        pageSize: 9999,
      };
      const result = await selectCoulumns(payload);
      let sourceData = [];
      if (result.data != null) {
        result.data.forEach(sourceDatas => {
          sourceData.push({ NAME: sourceDatas, VALUE: sourceDatas });
        });
      }

      this.setState({ sourceData: sourceData });
    }
  };

  /**
   * 设置state的数据源
   */
  setSourceData = sourceData => {
    const { textField, valueField } = this.props;
    if (this.props.onSourceDataChange) {
      this.props.onSourceDataChange(sourceData);
      return;
    }
    this.setState({
      sourceData: sourceData,
    });
  };

  buildOptions = () => {
    const { sourceData } = this.state;
    return sourceData.map(data => {
      return (
        <Select.Option value={data.VALUE} label={data.NAME} title={data.NAME}>
          {data.NAME}
        </Select.Option>
      );
    });
  };

  onFocus = async () => {
    this.initData();
  };

  onSearch = value => {
    if (this.props.isOrgQuery) {
      const searchField = this.props.searchField;
      let params = new Array();
      params.push({
        field: searchField.fieldName,
        type: searchField.fieldType,
        rule: 'like',
        val: value,
      });
      params = [...params, ...this.props.isOrgQuery];
      this.getCoulumns({ queryParams: params }, value);
    }
  };

  getCoulumns = async (pageFilters, value) => {
    const payload = { superQuery: pageFilters, quickuuid: this.props.reportCode };
    const result = await selectCoulumns(payload);
    let sourceData = new Array();
    if (result.data != null) {
      result.data.forEach(sourceDatas => {
        sourceData.push({ NAME: sourceDatas, VALUE: sourceDatas });
      });
    } else {
      sourceData.push({ NAME: value, VALUE: value });
    }
    this.setState({ sourceData: sourceData });
  };

  //全选/全不选
  checkAll = e => {
    let key = this.props.searchField.fieldName;
    let values = [];
    if (e == 'all') {
      const { sourceData } = this.state;
      sourceData.map(e => {
        values.push(e.VALUE);
      });
    }
    this.props.setFieldsValues({ [key]: values });
  };

  onChange = value => {
    if (value instanceof Array) this.props.onChange && this.props.onChange(value.reverse());
    else this.props.onChange && this.props.onChange(value);
  };

  render() {
    //查询类型为in时 变为多选
    let mu = {};
    let isMu =
      this.props.searchField?.searchCondition &&
      (this.props.searchField.searchCondition == 'in' ||
        this.props.searchField.searchCondition == 'notIn');
    if (isMu) {
      mu = {
        mode: 'multiple',
        optionLabelProp: 'label',
      };
    }

    return (
      //antd select dropdownRender bug 需要通过阻止事件默认行为，使click事件生效
      <div
        onMouseDown={e => {
          e.preventDefault();
          return false;
        }}
      >
        <Select
          {...this.props}
          onChange={this.onChange}
          onSearch={this.onSearch}
          onFocus={this.onFocus}
          {...mu}
          maxTagCount={1}
          maxTagPlaceholder={e => {
            const { sourceData } = this.state;
            let title = [];
            sourceData.map(x => {
              if (e.indexOf(x.VALUE) != -1) {
                title.push(x.NAME);
              }
            });
            return <Tooltip title={title.join(',')}>{`+${e?.length}`}</Tooltip>;
          }}
          maxTagTextLength={this.props.searchField?.fieldWidth}
          dropdownRender={menu =>
            isMu ? (
              <div>
                {menu}
                <Divider style={{ margin: '4px 0' }} />
                <Row>
                  <Col span={12}>
                    <Button
                      type="primary"
                      onClick={() => this.checkAll('all')}
                      style={{ margin: '0 2px 2px 2px' }}
                    >
                      全选
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button onClick={() => this.checkAll('no')} style={{ margin: '0 2px 2px 2px' }}>
                      全不选
                    </Button>
                  </Col>
                </Row>
              </div>
            ) : (
              <div>{menu}</div>
            )
          }
        >
          {this.buildOptions()}
        </Select>
      </div>
    );
  }
}
