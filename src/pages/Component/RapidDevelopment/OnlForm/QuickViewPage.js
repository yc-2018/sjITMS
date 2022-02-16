import { connect } from 'dva';
import moment from 'moment';
import { Fragment } from 'react';
import { Button, Tabs, message, Spin } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { orgType } from '@/utils/OrgType';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import Empty from '@/pages/Component/Form/Empty';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import { commonLocale } from '@/utils/CommonLocale';
import { addressToStr, convertCodeName, formatDate } from '@/utils/utils';
import { basicState } from '@/utils/BasicState';
import { havePermission } from '@/utils/authority';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { accMul } from '@/utils/QpcStrUtil';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';

const TabPane = Tabs.TabPane;

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class QuickView extends ViewPage {
  entity = {};
  //初始化表单数据
  initonlFormField = () => {
    const { onlFormField } = this.props;
    onlFormField.forEach(item => {
      //初始化表名称
      this.entity[item.onlFormHead.tableName] = [];
      //一对一初始化entity
      if (
        item.onlFormHead.relationType != '0' ||
        item.onlFormHead.tableType == '1' ||
        item.onlFormHead.tableType == '0'
      ) {
        this.entity[item.onlFormHead.tableName][0] = {};
      }
    });
  };

  constructor(props) {
    super(props);

    this.state = { title: '信息', quickuuid: props.quickuuid, entityUuid: props.quick.entityUuid };

    this.initonlFormField();
  }

  componentDidMount() {
    this.dynamicqueryById();
  }

  componentWillReceiveProps(nextProps) {}

  dynamicqueryById() {
    const { onlFormField } = this.props;
    onlFormField.forEach(item => {
      let tableName = item.onlFormHead.tableName;
      if (item.onlFormHead.tableType == '1' || item.onlFormHead.tableType == '0') {
        var field = item.onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
        const param = {
          tableName: tableName,
          condition: {
            params: [{ field: field, rule: 'eq', val: [this.props.quick.entityUuid] }],
          },
        };
        this.props.dispatch({
          type: 'quick/dynamicqueryById',
          payload: param,
          callback: response => {
            if (response.result.records != 'false') {
              this.entity[tableName] = response.result.records;
              this.setState({});
            }
          },
        });
      } else {
        var field = item.onlFormFields.find(x => x.mainField != null && x.mainField != '')
          ?.dbFieldName;
        const param = {
          tableName: item.onlFormHead.tableName,
          condition: {
            params: [{ field: field, rule: 'eq', val: [this.props.quick.entityUuid] }],
          },
        };
        this.props.dispatch({
          type: 'quick/dynamicqueryById',
          payload: param,
          callback: response => {
            if (response.result.records != 'false') {
              this.entity[tableName] = response.result.records;
              for (let i = 0; i < this.entity[tableName].length; i++) {
                //增加line
                this.entity[tableName][i] = { ...this.entity[tableName][i], line: i + 1 };
              }
              this.setState({});
            }
          },
        });
      }
    });
  }

  /**
   * 刷新
   */
  refresh() {
    this.dynamicqueryById();
  }

  /**
   * 返回
   */
  onBack = () => {
    this.props.dispatch({
      type: 'quick/showPageMap',
      payload: {
        showPageK: this.state.quickuuid,
        showPageV: this.state.quickuuid + 'query',
      },
    });
  };

  /**
   * 编辑
   */
  onEdit = () => {
    this.props.dispatch({
      type: 'quick/showPageMap',
      payload: {
        showPageK: this.state.quickuuid,
        showPageV: this.state.quickuuid + 'update',
        entityUuid: this.state.entityUuid,
      },
    });
  };

  /**
   * 绘制右上角按钮
   */
  drawActionButtion = () => {
    return (
      <Fragment>
        <Button onClick={this.onBack}>{commonLocale.backLocale}</Button>
        {/* {loginOrg().type === 'COMPANY' ? (
          <Button type="primary" onClick={this.onEdit}>
            {commonLocale.editLocale}
          </Button>
        ) : null} */}
        <Button type="primary" onClick={this.onEdit}>
          {commonLocale.editLocale}
        </Button>
      </Fragment>
    );
  };

  /**
   * 绘制信息详情
   */
  drawQuickInfoTab = () => {
    const { entity } = this.state;
    const { onlFormField } = this.props;
    //没数据直接return
    if (onlFormField.length <= 0) return;
    let quickItems = [];
    let itemsMore = [];
    onlFormField.forEach((item, index) => {
      let items = [];
      let itemInfo;
      let tableName = item.onlFormHead.tableName;
      //判断是主表跟单表
      if (item.onlFormHead.tableType == 1 || item.onlFormHead.tableType == 0) {
        //遍历主表跟单表配置信息
        item.onlFormFields.forEach(field => {
          itemInfo = {
            label: field.dbFieldName,
            value: this.entity[tableName][0][field.dbFieldName],
          };
          items.push(itemInfo);
        });
      } else {
        if (item.onlFormHead.relationType == 1) {
          //遍历一对一从表配置信息
          item.onlFormFields.forEach(field => {
            itemInfo = {
              label: field.dbFieldName,
              value: this.entity[tableName][0][field.dbFieldName],
            };
            items.push(itemInfo);
          });
        } else {
          //遍历一对多从表配置信息
          item.onlFormFields.forEach(field => {
            itemInfo = {
              title: field.dbFieldName,
              dataIndex: field.dbFieldName,
              key: tableName + field.dbFieldName + index,
              width: itemColWidth.articleEditColWidth,
            };
            items.push(itemInfo);
          });
        }
      }
      //一对一,一对多分开保存
      if (
        item.onlFormHead.relationType != 0 ||
        item.onlFormHead.tableType == 1 ||
        item.onlFormHead.tableType == 0
      ) {
        quickItems.push(
          <ViewPanel
            items={items}
            title={item.onlFormHead.tableTxt}
            key={item.onlFormHead.tableTxt}
          />
        );
      } else {
        itemsMore.push(
          <ViewTablePanel
            title={item.onlFormHead.tableTxt}
            columns={items}
            data={this.entity[tableName] ? this.entity[tableName] : []}
            key={item.onlFormHead.tableTxt}
          />
        );
      }
    });
    //将一对多放到最后
    let itemMerge = [...quickItems, ...itemsMore];
    return (
      <TabPane key="basicInfo" tab="信息">
        {itemMerge}
      </TabPane>
    );
  };

  /**
   * 绘制Tab页
   */
  drawTabPanes = () => {
    let tabPanes = [this.drawQuickInfoTab()];
    return tabPanes;
  };

  /**
   * 跳转至列表页面
   */
  onCancel = () => {
    this.props.dispatch({
      type: 'quick/showPageMap',
      payload: {
        showPageK: this.state.reportCode,
        showPageV: this.state.reportCode + 'query',
      },
    });
  };
}
