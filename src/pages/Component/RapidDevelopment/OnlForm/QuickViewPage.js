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
import { routerRedux } from 'dva/router';

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
      let tableName;
      if (item.onlFormHead.viewSql) {
        tableName = item.onlFormHead.viewSql;
      } else {
        tableName = item.onlFormHead.tableName;
      }
      //初始化表名称
      this.entity[tableName] = [];
      //一对一初始化entity
      if (
        item.onlFormHead.relationType != '0' ||
        item.onlFormHead.tableType == '1' ||
        item.onlFormHead.tableType == '0'
      ) {
        this.entity[tableName][0] = {};
      }
    });
  };

  constructor(props) {
    super(props);

    this.state = {
      title: '基本信息',
      quickuuid: props.quickuuid,
      entityUuid: props.params.entityUuid,
    };

    this.initonlFormField();
  }

  componentDidMount() {
    this.dynamicqueryById();
  }

  componentWillReceiveProps(nextProps) {}

  dynamicqueryById() {
    const { onlFormField } = this.props;
    onlFormField.forEach(item => {
      let tableName;
      if (item.onlFormHead.viewSql) {
        tableName = item.onlFormHead.viewSql;
      } else {
        tableName = item.onlFormHead.tableName;
      }
      if (item.onlFormHead.tableType == '1' || item.onlFormHead.tableType == '0') {
        var field = item.onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
        const param = {
          tableName: tableName,
          condition: {
            params: [{ field: field, rule: 'eq', val: [this.props.params.entityUuid] }],
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
          tableName: tableName,
          condition: {
            params: [{ field: field, rule: 'eq', val: [this.props.params.entityUuid] }],
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
    this.props.switchTab('query');
  };

  /**
   * 编辑
   */
  onEdit = () => {
    this.props.switchTab('update', { entityUuid: this.props.params.entityUuid });
  };

  //跳转到其他详情页
  onOtherView = (jumpPaths, tableName) => {
    if (!jumpPaths || jumpPaths.length != 2) {
      message.error('配置为空或配置错误，请检查点击事件配置！');
      return;
    }

    console.log('jumpPath', jumpPaths[0], 'data', this.entity[tableName][jumpPaths[1]]);

    this.props.dispatch(
      routerRedux.push({
        pathname: jumpPaths[0],
        state: {
          tab: 'view',
          param: {
            entityUuid: this.entity[tableName][0][jumpPaths[1]],
            quickuuid: this.state.quickuuid,
          },
        },
      })
    );
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

  //数据转换
  convertData = (data, preview, record) => {
    if (!preview) return data;
    return record[preview];
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
      let tableName;
      if (item.onlFormHead.viewSql) {
        tableName = item.onlFormHead.viewSql;
      } else {
        tableName = item.onlFormHead.tableName;
      }

      //判断是主表跟单表
      if (item.onlFormHead.tableType == 1 || item.onlFormHead.tableType == 0) {
        //遍历主表跟单表配置信息
        item.onlFormFields.forEach(field => {
          //判断是否显示
          if (!field.isViewForm) return;
          let jumpPaths;
          let fieldName;
          if (field.jumpPath) {
            jumpPaths = field.jumpPath.split(',');
          }
          if (field.preview) {
            fieldName = field.preview;
          } else {
            fieldName = field.dbFieldName;
          }
          itemInfo = {
            label: field.dbFieldTxt,
            value:
              field.clickEvent == '2' ? (
                <a onClick={this.onOtherView.bind(true, jumpPaths, tableName)}>
                  {this.entity[tableName][0][fieldName]}
                </a>
              ) : (
                this.entity[tableName][0][fieldName]
              ),
          };
          items.push(itemInfo);
        });
      } else {
        if (item.onlFormHead.relationType == 1) {
          //遍历一对一从表配置信息
          item.onlFormFields.forEach(field => {
            //判断是否显示
            if (!field.isViewForm) return;
            if (field.preview) {
              fieldName = field.preview;
            } else {
              fieldName = field.dbFieldName;
            }
            itemInfo = {
              label: field.dbFieldTxt,
              value: this.entity[tableName][0][field.dbFieldName],
            };
            items.push(itemInfo);
          });
        } else {
          //遍历一对多从表配置信息
          item.onlFormFields.forEach(field => {
            //判断是否显示
            if (!field.isViewForm) return;

            itemInfo = {
              title: field.dbFieldTxt,
              dataIndex: field.dbFieldName,
              key: tableName + field.dbFieldName + index,
              width: itemColWidth.articleEditColWidth,
              render:
                field.clickEvent == '1'
                  ? (val, record) => (
                      <a onClick={this.onView.bind(this, record)}>
                        {this.convertData(val, field.preview, record)}
                      </a>
                    )
                  : field.clickEvent == '2'
                    ? (val, record) => (
                        <a onClick={this.onOtherView.bind(this, record, jumpPaths)}>
                          {this.convertData(val, field.preview, record)}
                        </a>
                      )
                    : (val, record) => <p3>{this.convertData(val, field.preview, record)}</p3>,
            };
            items.push(itemInfo);
          });
        }
      }

      //为空时直接return
      if (items.length <= 0) return;

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
      <TabPane key="basicInfo" tab="基本信息">
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
