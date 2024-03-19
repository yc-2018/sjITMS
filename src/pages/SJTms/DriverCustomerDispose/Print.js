/*
 * @Author: guankongjin
 * @Date: 2024-03-08 14:02:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2024-03-19 10:52:11
 * @Description: 打印拣货记录
 * @FilePath: \iwms-web\src\pages\SJTms\DriverCustomerDispose\Print.js
 */
import { sumBy } from 'lodash';
import { convertDateToTime } from '@/utils/utils';
import { loginUser } from '@/utils/LoginContext';

export const drawPrintPage = (detail, records) => {
  const centerStyle = { textAlign: 'center' };
  return (
    <div style={{ minHeight: 400 }}>
      <table
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, border: 0 }}
        border={1}
        cellPadding={0}
        cellSpacing={0}
      >
        <thead>
          <tr style={{ height: 50 }}>
            <th colspan={8} style={{ border: 0 }}>
              <div style={{ fontSize: 25, textAlign: 'center' }}>电子标签拣货货品，周转筐查询</div>
            </th>
          </tr>
          <tr>
            <th colspan={8} style={{ border: 0 }}>
              <div style={{ textAlign: 'left', fontWeight: 'normal', height: 20 }}>
                <div style={{ float: 'left', width: '30%' }}>制单人: {loginUser().name}</div>
                <div style={{ float: 'left', width: '32%' }}>打印时间: {convertDateToTime(new Date())}</div>
                <div style={{ float: 'left', width: '32%' }}>申请货品:{detail.articlecode}</div>
              </div>
            </th>
          </tr>
          <tr style={{ textAlign: 'center', height: 25, borderColor: "#011627" }}>
            <th width={100}>周转箱号</th>
            <th width={50}>捡货位</th>
            <th width={50}>货品代码</th>
            <th width={50}>拣货门店</th>
            <th width={50}>差异数量</th>
            <th width={50}>实际数量</th>
            <th width={120}>确认时间</th>
            <th width={200}>货品名称</th>
          </tr>
        </thead>
        <tbody>
          {records ? (
            records.map((item) => {
              return (
                <tr
                  style={{
                    height: 20,
                    borderColor: "#011627",
                    fontSize: detail.articlecode == item.sku ? 14 : 12,
                    fontWeight: detail.articlecode == item.sku ? "bold" : "normal"
                  }}
                >
                  <td width={90}>{item.cartonno}</td>
                  <td width={50} style={{textAlign: 'center'}}>{item.fmlocation}</td>
                  <td width={50} style={{textAlign: 'center'}}>{item.sku}</td>
                  <td width={50} style={{textAlign: 'center'}}>{item.consigneeid}</td>
                  <td width={50} style={{textAlign: 'center'}}>{detail.articlecode == item.sku ? detail.qty : ""}</td>
                  <td width={50} style={{textAlign: 'center'}}>{item.qtyordered}</td>
                  <td width={130} style={{textAlign: 'center'}}>{item.edittime}</td>
                  <td width={200}>{item.descrC}</td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
        </tbody>
        <tfoot>
          <tr style={{ height: 25, borderColor: "#011627" }}>
            <td colspan={4}>合计:</td>
            <td style={centerStyle}>{detail.qty}</td>
            <td style={centerStyle}>
              {records ? (Math.round(sumBy(records, x => x.qtyordered) * 100) / 100) : 0}
            </td>
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
