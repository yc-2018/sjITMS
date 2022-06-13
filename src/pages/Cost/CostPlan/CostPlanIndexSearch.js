/*
 * @Author: Liaorongchang
 * @Date: 2022-06-13 17:21:01
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-13 17:21:14
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Form } from 'antd';
import { connect } from 'dva';
import CostPlanIndex from '@/pages/Cost/CostPlan/CostPlanIndex';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class CostPlanSearch extends CostPlanIndex {}
