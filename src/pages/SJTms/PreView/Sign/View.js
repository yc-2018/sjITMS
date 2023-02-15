/*
 * @Author: guankongjin
 * @Date: 2022-12-09 08:51:33
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-02-15 14:57:00
 * @Description: 签到大屏
 * @FilePath: \iwms-web\src\pages\SJTms\PreView\Sign\View.js
 */
import { PureComponent } from 'react';
import { queryDataByOpen } from '@/services/quick/Open';
import { queryDictByCode } from '@/services/quick/Quick';
import { Select } from 'antd';
import moment from 'moment';

export default class View extends PureComponent {
  state = {
    companyUuid: undefined,
    dispatchUuid: undefined,
    dispatchName: undefined,
    dict: [],
    scheduleData: [],
  };

  componentDidMount() {
    // 查询字典
    queryDictByCode(['dispatchCenter']).then(res => this.setState({ dict: res.data }));
    if (
      localStorage.getItem('dispatchUuid') != undefined &&
      localStorage.getItem('dispatchName') &&
      localStorage.getItem('companyUuid')
    ) {
      this.setState({
        dispatchUuid: localStorage.getItem('dispatchUuid'),
        dispatchName: localStorage.getItem('dispatchName'),
        companyUuid: localStorage.getItem('companyUuid'),
      });
    }
    this.searchSchedulePool();
    clearInterval();
    setInterval(() => {
      this.searchSchedulePool();
    }, 5000);
  }

  searchSchedulePool = async () => {
    const { dispatchUuid, companyUuid } = this.state;
    let filter = { superQuery: { matchType: 'and', queryParams: [] } };
    filter.superQuery.queryParams = [
      { field: 'COMPANYUUID', type: 'VarChar', rule: 'eq', val: companyUuid },
      { field: 'DISPATCHCENTERUUID', type: 'VarChar', rule: 'eq', val: dispatchUuid },
      {
        field: 'WAVENUM',
        type: 'VarChar',
        rule: 'eq',
        val: moment(new Date()).format('YYMMDD') + '0001',
      },
      // { field: 'REVIEWTIME', type: 'VarChar', rule: 'ne', val: '' },
      { field: 'SHIPSTAT', type: 'VarChar', rule: 'eq', val: '1' },
      { field: 'STAT', type: 'VarChar', rule: 'eq', val: 'Approved' },
    ];
    filter.order = 'REVIEWTIME,ascend';
    filter.quickuuid = 'sj_itms_schedulepool';
    const response = await queryDataByOpen(filter);
    if (response.success) {
      let scheduleData = response.data.records ? response.data.records : [];
      scheduleData = scheduleData.filter(x => x.REVIEWTIME);
      this.setState({ scheduleData });
    }
  };

  render() {
    const { scheduleData, dispatchUuid, dispatchName, dict } = this.state;
    const remIndex = 20 - scheduleData.length;
    const items = [];
    for (let index = 0; index < remIndex; index++) {
      items.push(
        <tr style={{ height: 40 }} key={index}>
          <td style={{ border: '2px solid #fff' }} />
          <td style={{ border: '2px solid #fff' }} />
          <td style={{ border: '2px solid #fff' }} />
          <td style={{ border: '2px solid #fff' }} />
          <td style={{ border: '2px solid #fff' }} />
          <td style={{ border: '2px solid #fff' }} />
          <td style={{ border: '2px solid #fff' }} />
        </tr>
      );
    }
    return dispatchUuid ? (
      <table
        style={{
          height: '100vh',
          width: '100vw',
          borderCollapse: 'collapse',
          borderSpacing: 0,
          fontFamily: 'Microsoft YaHei',
        }}
      >
        <thead style={{ fontSize: '2rem', height: 40, textAlign: 'center', fontWeight: '600' }}>
          <tr>
            <td>配货作业</td>
            <td>装车单号</td>
            <td>车牌号</td>
            <td>司机</td>
            <td>送货员</td>
            <td>班组</td>
            <td>备注</td>
          </tr>
        </thead>
        <tbody
          style={{
            background: '#000',
            fontSize: '2rem',
            textAlign: 'center',
            fontWeight: '500',
          }}
        >
          {scheduleData.length > 0 ? (
            scheduleData.map(schedule => {
              console.log(schedule);
              return (
                <tr
                  style={{
                    height: 40,
                    color: schedule.CHECKTIME && schedule.PIRS == undefined ? '#E71D36' : '#33CD33',
                  }}
                >
                  <td style={{ border: '2px solid #fff' }}>{schedule.WAVENUM}</td>
                  <td style={{ border: '2px solid #fff' }}>{schedule.BILLNUMBER}</td>
                  <td style={{ border: '2px solid #fff' }}>{schedule.VEHICLEPLATENUMBER}</td>
                  <td style={{ border: '2px solid #fff' }}>
                    {schedule.CARRIERNAME?.replace(/\([^\)]*\)|\（[^\)]*\）/g, '')}
                  </td>
                  <td style={{ border: '2px solid #fff' }}>
                    {schedule.DELIVERYMAN?.replace(/\([^\)]*\)|\（[^\)]*\）/g, '')}
                  </td>
                  <td style={{ border: '2px solid #fff' }}>{schedule.CONTACT}</td>
                  <td style={{ border: '2px solid #fff' }}>
                    {schedule.CHECKTIME
                      ? schedule.PIRS
                        ? '已签到，月台' + schedule.PIRS
                        : '签到超时'
                      : '未签到，可以装车'}
                  </td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
          {items}
        </tbody>
      </table>
    ) : (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <div style={{ width: 400, marginTop: 100 }}>
          <Select
            placeholder="请选择调度中心"
            onChange={val => {
              const item = dict.find(x => x.itemValue == val);
              localStorage.setItem('dispatchUuid', val);
              localStorage.setItem('dispatchName', item.itemText);
              localStorage.setItem('companyUuid', item.description);
              this.setState({
                dispatchUuid: val,
                dispatchName: item.itemText,
                companyUuid: item.description,
              });
            }}
            value={dispatchName}
            allowClear={true}
            style={{ width: '100%' }}
          >
            {dict.map(d => {
              return <Select.Option key={d.itemValue}>{d.itemText}</Select.Option>;
            })}
          </Select>
        </div>
        <div
          style={{
            fontSize: 55,
            marginTop: 50,
            fontWeight: 'normal',
            color: 'red',
          }}
        >
          请选择调度中心
        </div>
      </div>
    );
  }
}
