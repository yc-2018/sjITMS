/*
 * @Author: guankongjin
 * @Date: 2022-12-09 08:51:33
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-12-10 09:21:57
 * @Description: 签到大屏
 * @FilePath: \iwms-web\src\pages\SJTms\PreView\Sign\View.js
 */
import { PureComponent } from 'react';
import { queryData } from '@/services/quick/Quick';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import moment from 'moment';

export default class View extends PureComponent {
  state = {
    scheduleData: [],
  };

  componentDidMount() {
    this.searchSchedulePool();
    clearInterval();
    setInterval(() => {
      this.searchSchedulePool();
    }, 5000);
  }

  searchSchedulePool = async () => {
    let filter = { superQuery: { matchType: 'and', queryParams: [] } };
    filter.superQuery.queryParams = [
      { field: 'COMPANYUUID', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
      { field: 'DISPATCHCENTERUUID', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
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
    const response = await queryData(filter);
    if (response.success) {
      let scheduleData = response.data.records ? response.data.records : [];
      scheduleData = scheduleData.filter(x => x.REVIEWTIME);
      this.setState({ scheduleData });
    }
  };

  render() {
    const { scheduleData } = this.state;
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
        </tr>
      );
    }
    return (
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
            <td>车牌号</td>
            <td>司机</td>
            <td>配货作业</td>
            <td>装车单号</td>
            <td>送货员</td>
            <td>班组</td>
          </tr>
        </thead>
        <tbody
          style={{
            background: '#000',
            fontSize: '2rem',
            textAlign: 'center',
            fontWeight: '500',
            color: '#33CD33',
          }}
        >
          {scheduleData.length > 0 ? (
            scheduleData.map(schedule => {
              return (
                <tr style={{ height: 40 }}>
                  <td style={{ border: '2px solid #fff' }}>{schedule.VEHICLEPLATENUMBER}</td>
                  <td style={{ border: '2px solid #fff' }}>
                    {schedule.CARRIERNAME?.replace(/\([^\)]*\)|\（[^\)]*\）/g, '')}
                  </td>
                  <td style={{ border: '2px solid #fff' }}>{schedule.WAVENUM}</td>
                  <td style={{ border: '2px solid #fff' }}>{schedule.BILLNUMBER}</td>
                  <td style={{ border: '2px solid #fff' }}>
                    {schedule.DELIVERYMAN?.replace(/\([^\)]*\)|\（[^\)]*\）/g, '')}
                  </td>
                  <td style={{ border: '2px solid #fff' }}>{schedule.CONTACT}</td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
          {items}
        </tbody>
      </table>
    );
  }
}
