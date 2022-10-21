/*
 * @Author: Liaorongchang
 * @Date: 2022-10-20 16:36:25
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-20 16:42:00
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickViewPage';
import { Tabs } from 'antd';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import ViewTablePanel from '@/pages/Component/RapidDevelopment/CommonLayout/RyzeView/ViewTablePanel';

const TabPane = Tabs.TabPane;

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class HighWayAreaGroupViewPage extends QuickViewPage {
  /**
   * 绘制信息详情
   */
  drawQuickInfoTab = () => {
    const { singleItems, oddItems, onlFormInfos, noActionCol, notNote } = this.state;
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
        let OptColumn = {
          title: '操作',
          width: itemColWidth.operateColWidth,
          render: record => this.renderOperateCol(record),
        };
        catelogItems.push(OptColumn);
        const data = this.entity[tableName].filter(x => x.TYPE == 'leave');
        console.log('data', data);
        items.push(
          <ViewTablePanel
            notNote={notNote}
            style={{ marginTop: '24px' }}
            title={item.onlFormHead.tableTxt}
            columns={catelogItems}
            noActionCol={noActionCol}
            data={data ? data : []}
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
}
