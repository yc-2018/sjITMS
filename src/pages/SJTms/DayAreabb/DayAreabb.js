
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { guid } from '@/utils/utils';
@connect(({ quick, loading }) => ({
    quick,
    loading: loading.models.quick,
}))
export default class DayAreabb extends QuickFormSearchPage {
    initData = data => {
        // 海鼎底层需要uuid作为StandardTable的rowkey
        if (data?.records && data.records.length > 0 && !data.records[0].uuid) {
          data.records.forEach(row => (row.uuid = guid()));
        }
        //根据配置规则 分组数据
        const { isMerge, queryConfig } = this.state;
        let records = data.records;
        if (isMerge && data.records) {
          const { columns, reportHead } = queryConfig;
          let list = data.records;
          let newList = [];
          let mergeRule = reportHead.mergeRule?.split(',');
          let listGroup = groupBy(list, e => {
            return mergeRule.map(x => {
              return e[x];
            });
          });
          //合并数据
          newList = Object.keys(listGroup).map(e => {
            const list = listGroup[e];
            let newRecord = {};
            for (let c of columns) {
              newRecord[c.fieldName] = this.getDataByMergeRule(c.mergeRule, list, c.fieldName);
            }
            newRecord['uuid'] = this.getDataByMergeRule(1, list, 'uuid') + ',header';
            for (let d of list) {
              d.puuid = newRecord['uuid'];
            }
            return newRecord;
          });
          //将子类写入父类
          newList.forEach(n => {
            let code = mergeRule.map(x => {
              return n[x];
            });
            n.detail = listGroup[code];
            n.isHeader = true;
          });
          records = newList;
        }
        let colTotal = data.columnTotal;
        colTotal[0].均件重 = (colTotal[0].均件重/data.records?.length).toFixed(5)
        colTotal[0].均店整件= (colTotal[0].均店整件/data.records?.length).toFixed(5)
        colTotal[0].均店重= (colTotal[0].均店重/data.records?.length).toFixed(5)
        var data = {
          list: records,
          pagination: {
            total: data.paging.recordCount,
            pageSize: data.paging.pageSize,
            current: data.page,
            showTotal: total => `共 ${total} 条`,
          },
        };
        this.setState({ data, selectedRows: [], colTotal });
      };

}