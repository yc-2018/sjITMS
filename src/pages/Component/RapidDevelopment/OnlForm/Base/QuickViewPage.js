import { connect } from 'dva';
import moment from 'moment';
import { Fragment } from 'react';
import { Button, Tabs, message, Spin, Input } from 'antd';
// import ViewPage from '@/pages/Component/Page/ViewPage';
import RyzeViewPage from '../../CommonLayout/RyzeViewPage';
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
// import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ViewTablePanel from '@/pages/Component/RapidDevelopment/CommonLayout/RyzeView/ViewTablePanel';
import { routerRedux } from 'dva/router';

const TabPane = Tabs.TabPane;

/**
 * 预览界面
 */
export default class QuickView extends RyzeViewPage {
  entity = {};
  drawcell = e => {}; //扩展component
  //初始化表单数据
  initonlFormField = () => {
    const { onlFormInfos } = this.state;
    onlFormInfos.forEach(item => {
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
      entityCode: '',
      onlFormInfos: props.onlFormField,
      singleItems: [],
      oddItems: [],
    };
  }

  componentDidMount() {
    this.init();
  }

  init = async () => {
    if (!this.props.onlFormField) {
      const response = await this.queryCreateConfig();
      if (response.result) {
        this.setState({
          onlFormInfos: response.result,
        });
      }
    }
    this.initonlFormField();
    this.dynamicqueryById();
    this.initAllViewItems();
  };

  /**
   * 获取配置信息
   */
  queryCreateConfig = () => {
    return new Promise((resolve, reject) => {
      this.props.dispatch({
        type: 'quick/queryCreateConfig',
        payload: this.state.quickuuid,
        callback: response => {
          resolve(response);
        },
      });
    });
  };

  initAllViewItems = () => {
    const { onlFormInfos } = this.state;
    //找出非一对多的所有Items;
    let singleItems = onlFormInfos.filter(item => {
      return item.onlFormHead.tableType != 2 || item.onlFormHead.relationType != 0;
    });
    //找出一对多的Items
    let oddItems = onlFormInfos.filter(item => {
      return item.onlFormHead.tableType == 2 && item.onlFormHead.relationType == 0;
    });

    this.setState({ oddItems: oddItems });
    this.setState({ singleItems: singleItems });
  };

  initSingleItems = singleItems => {
    const { entity } = this;
    let resultItems = [];
    for (const singleItem of singleItems) {
      const { onlFormFields, onlFormHead } = singleItem;
      const { viewSql } = onlFormHead;
      let tableName = viewSql ? viewSql : onlFormHead.tableName;
      for (const field of onlFormFields) {
        const { jumpPath, preview, dbFieldTxt, clickEvent, category, isViewForm } = field;
        if (!isViewForm) continue;
        let fieldName = preview ? preview : field.dbFieldName;
        let jumpPaths = jumpPath ? jumpPath.split(',') : [];
        let itemInfo = {
          label: dbFieldTxt,
          value:
            clickEvent == '2' ? (
              <a onClick={this.onOtherView.bind(true, jumpPaths, tableName)}>
                {this.entity[tableName][0][fieldName]}
              </a>
            ) : (
              this.entity[tableName][0][fieldName]
            ),
        };
        let e = {
          onlFormHead: onlFormHead,
          onlFormField: field,
          component: itemInfo,
          val: this.entity[tableName][0][fieldName],
          category: category,
        };
        this.drawcell(e);
        resultItems.push(e);
      }
    }

    return resultItems;
  };

  //获取category
  getCategory = () => {
    const { onlFormInfos } = this.state;
    let categories = [];
    for (const onlFormInfo of onlFormInfos) {
      const { onlFormHead, onlFormFields } = onlFormInfo;
      // 默认表描述作为一个分类
      categories.push(onlFormHead.tableTxt);
      // 找到有做分类处理
      if (onlFormFields.find(field => field.category)) {
        const categorySorts = onlFormFields
          .map(field => {
            return { categorySort: field.categorySort, category: field.category };
          })
          .filter((item, index, arr) => arr.findIndex(x => x.category == item.category) === index)
          .sort(item => item.categorySort);
        for (const item of categorySorts) {
          categories.push(item.category);
        }
      }
    }
    // 去重
    categories = categories.filter((item, index, arr) => arr.indexOf(item) === index);
    return categories;
    //this.setState({ categories: categories });
  };

  componentWillReceiveProps(nextProps) {}

  dynamicqueryById() {
    //const { onlFormField } = this.props;
    const onsda = this.state.onlFormInfos;
    onsda.forEach(item => {
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
              let title = item.onlFormHead.formTitle;
              if (item.onlFormHead.formTitle && item.onlFormHead.formTitle.indexOf(']') != -1) {
                const titles = item.onlFormHead.formTitle.split(']');
                var entityCode = response.result.records[0][titles[0].replace('[', '')];
                var entityTitle =
                  titles[1].indexOf('}') == -1
                    ? titles[1]
                    : response.result.records[0][titles[1].replace('}', '').replace('{', '')];
                title = '[' + entityCode + ']' + entityTitle;
              }
              this.setState({ title: title, entityCode: entityCode });
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
   * 通过指定字段查
   */
  dynamicQuery(entityCode, entityUuid) {
    const { onlFormInfos } = this.state;
    onlFormInfos.forEach(item => {
      let tableName;
      if (item.onlFormHead.viewSql) {
        tableName = item.onlFormHead.viewSql;
      } else {
        tableName = item.onlFormHead.tableName;
      }
      if (item.onlFormHead.tableType == '1' || item.onlFormHead.tableType == '0') {
        let titles;
        var keyName = item.onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
        if (item.onlFormHead.formTitle && item.onlFormHead.formTitle.indexOf(']') != -1) {
          titles = item.onlFormHead.formTitle.split(']');
          var field = titles[0].substr(1);
        }
        if (!entityCode && !entityUuid) {
          entityCode = this.state.entityCode;
        }
        const param = {
          tableName: tableName,
          condition: {
            params: [{ field: field, rule: 'eq', val: [entityCode] }],
          },
        };
        this.props.dispatch({
          type: 'quick/dynamicqueryById',
          payload: param,
          callback: response => {
            if (response.result.records != 'false') {
              this.entity[tableName] = response.result.records;
              var entityTitle =
                titles[1].indexOf('}') == -1
                  ? titles[1]
                  : response.result.records[0][titles[1].replace('}', '').replace('{', '')];
              let title = '[' + response.result.records[0][titles[0].substr(1)] + ']' + entityTitle;

              this.setState({
                entityCode: entityCode,
                title: title,
                entityUuid: response.result.records[0][keyName],
              });
            } else {
              message.error('查询的数据不存在！');
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
  refresh(entityCode, entityUuid) {
    this.dynamicQuery(entityCode, entityUuid);
  }

  /**
   * 返回
   */
  onBack = () => {
    this.props.switchTab('query');
    // this.props.switchTab('query');
  };

  /**
   * 编辑
   */
  onEdit = () => {
    this.props.switchTab('update', { entityUuid: this.state.entityUuid });
  };

  //跳转到其他详情页
  onOtherView = (jumpPaths, tableName) => {
    if (!jumpPaths || jumpPaths.length != 2) {
      message.error('配置为空或配置错误，请检查点击事件配置！');
      return;
    }

    //console.log('jumpPath', jumpPaths[0], 'data', this.entity[tableName][jumpPaths[1]]);

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
        <Button
          hidden={!havePermission(this.state.quickuuid + '.edit')}
          type="primary"
          onClick={this.onEdit}
        >
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

  //自定义table的render
  customize(record, val, component, field, onlFormHead) {
    let e = {
      onlFormField: field,
      onlFormHead: onlFormHead,
      record: record,
      component: component,
      val: val,
      // props: { ...commonPropertis, ...fieldExtendJson },
    };

    //自定义报表的render
    this.drawcell(e);

    return e.component;
  }

  getGutt = () => {
    const { onlFormInfos } = this.state;
    let { singleItems } = this.state;
    let categories = this.getCategory();
    let nums = onlFormInfos[0].onlFormHead.formTemplate
      ? onlFormInfos[0].onlFormHead.formTemplate
      : 4;
    nums = nums == 0 ? 4 : nums;
    // console.log('nums', this.initSingleItems(singleItems).length);
    let gutt = [];
    for (var i = 0; i < categories.length; i++) {
      let guttItems = [];
      for (
        var j = 0;
        j < Object.getOwnPropertyNames(this.initSingleItems(singleItems)).length + 2;
        j++
      ) {
        guttItems.push(nums);
      }
      gutt.push(guttItems);
    }
    return gutt;
  };

  /**
   * 绘制信息详情
   */
  drawQuickInfoTab = () => {
    const { entity } = this.state;
    // const { onlFormInfos } = this.state;
    const { singleItems, oddItems, onlFormInfos } = this.state;
    //没数据直接return
    if (!onlFormInfos) return <TabPane key="1" tab="" />;

    let quickItems = [];
    let itemsMore = [];

    if (singleItems.length <= 0)
      return <TabPane key="1" tab={onlFormInfos[0].onlFormHead.tableTxt} />;

    let z = 0;
    let gutt = this.state.onlFormInfos[0].onlFormHead.formTemplateList
      ? this.state.onlFormInfos[0].onlFormHead.formTemplateList
      : this.getGutt()
        ? this.getGutt()
        : [];

    let categories = this.getCategory();
    let a = this.initSingleItems(singleItems); //非一对多
    let i = 1;
    for (const category of categories) {
      let items = [];
      let catelogItems = [];
      let key;
      for (const singleItem of a) {
        if (singleItem.category != category) continue;
        catelogItems.push(singleItem.component);
        key = singleItem.onlFormHead.tableTxt;
      }
      if (catelogItems.length <= 0) continue;
      items.push(
        <ViewPanel
          items={catelogItems}
          title={category}
          key={key}
          gutterCols={gutt[z] ? gutt[z] : null}
        />
      );
      quickItems.push(items);
      z++;
    }

    //TODO:一对多的渲染待优化
    onlFormInfos.forEach((item, index) => {
      let items = [];
      let itemInfo;
      let tableName;

      if (item.onlFormHead.viewSql) {
        tableName = item.onlFormHead.viewSql;
      } else {
        tableName = item.onlFormHead.tableName;
      }

      if (item.onlFormHead.relationType == 0 && item.onlFormHead.tableType == 2) {
        let catelogItems = [];
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
                ? (val, record) => {
                    const component = (
                      <a onClick={this.onView.bind(this, record)}>
                        {this.convertData(val, field.preview, record)}
                      </a>
                    );
                    return this.customize(
                      record,
                      this.convertData(val, field.preview, record),
                      component,
                      field,
                      item.onlFormHead
                    );
                  }
                : field.clickEvent == '2'
                  ? (val, record) => {
                      const component = (
                        <a onClick={this.onOtherView.bind(this, record, jumpPaths)}>
                          {this.convertData(val, field.preview, record)}
                        </a>
                      );
                      return this.customize(
                        record,
                        this.convertData(val, field.preview, record),
                        component,
                        field,
                        item.onlFormHead
                      );
                    }
                  : (val, record) => {
                      const component = <p3>{this.convertData(val, field.preview, record)}</p3>;
                      return this.customize(
                        record,
                        this.convertData(val, field.preview, record),
                        component,
                        field,
                        item.onlFormHead
                      );
                    },
          };

          catelogItems.push(itemInfo);
        });
        items.push(
          <ViewTablePanel
            style={{ marginTop: '24px' }}
            title={item.onlFormHead.tableTxt}
            columns={catelogItems}
            data={this.entity[tableName] ? this.entity[tableName] : []}
            key={item.onlFormHead.tableTxt + index}
          />
        );
      }

      //为空时直接return
      if (items.length <= 0) return;

      itemsMore.push(items);
    });
    //将一对多放到最后
    let itemMerge = [...quickItems, ...itemsMore];
    return (
      <TabPane
        key="1"
        tab={this.state.viewStyle?.noTitle ? '' : onlFormInfos[0].onlFormHead.tableTxt}
      >
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
}
