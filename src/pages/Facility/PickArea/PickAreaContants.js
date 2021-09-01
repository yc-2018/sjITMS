import { Select } from 'antd';
const Option = Select.Option;

/**拣货类型 */
export const PickType = {
  CASEANDSPLIT: {
    name: 'CASEANDSPLIT',
    caption: '整件+拆零'
  },
  CASE: {
    name: 'CASE',
    caption: '整件'
  },
  SPLIT: {
    name: 'SPLIT',
    caption: '拆零'
  }
};
/**操作方法 */
export const PickMethod = {
  MANUAL: {
    name: 'MANUAL',
    caption: '手工单据'
  },
  RF: {
    name: 'RF',
    caption: '手持终端'
  },
  RFID: {
    name: 'RFID',
    caption: '电子标签'
  },
  LABEL: {
    name: 'LABEL',
    caption: '标签拣货'
  },
  ROBOT: {
    name: 'ROBOT',
    caption: '机器人拣货'
  },
}
/**整托拣货方式 */
export const WholePickMethod = {
  MANUAL: {
    name: 'MANUAL',
    caption: '手工单据'
  },
  RF: {
    name: 'RF',
    caption: '手持终端'
  },
}
/**拣货模式 */
export const PickMode = {
  PICKING: {
    name: 'PICKING',
    caption: '摘果',
  },
  SOW: {
    name: 'SOW',
    caption: '播种',
  }
}
/**补货方式 */
export const RplMode = {
  RF: {
    name: 'RF',
    caption: '手持终端'
  },
  LABEL: {
    name: 'LABEL',
    caption: '打印标签'
  },
  MANUAL: {
    name: 'MANUAL',
    caption: '手工单据'
  },
}
/**补货步骤 */
export const RplStep = {
  ONESTEP: {
    name: 'ONESTEP',
    caption: '一步补货',
  },
  TWOSTEP: {
    name: 'TWOSTEP',
    caption: '二步补货',
  }
}
/**补货类型 */
export const RplType = {
  STATIC: {
    name: 'STATIC',
    caption: '静态补货'
  },
  DYANMIC: {
    name: 'DYANMIC',
    caption: '动态补货'
  },
}

/**补货算法 */
export const RplMethod = {
  WHOLE: {
    name: 'WHOLE',
    caption: '整托盘',
  },
  HIGHANDLOW: {
    name: 'HIGHANDLOW',
    caption: '最高最低库存',
  },
  HIGHANDLOW_WHOLE:{
    name: 'HIGHANDLOW_WHOLE',
    caption: '最低最高库存-整',  
  },
  ENOUGHOUT: {
    name: 'ENOUGHOUT',
    caption: '够出货量',
  },
  RPLFULL: {
    name: 'RPLFULL',
    caption: '补货满',
  },
}
/**补货算法加强 */
export const RplMethodExtend = {
  T_REPAIR: {
    name: 'T_REPAIR',
    caption: 'T值尾盘修复',
  },
}
/**是or否 */
export const BasicIf = {
  true: {
    name: true,
    caption: '是'
  },
  false: {
    name: false,
    caption: '否'
  }
}

export function getBasicIfCaption(value) {
  let caption;
  Object.keys(BasicIf).forEach(function (key) {
    if (BasicIf[key].name === value) {
      caption = BasicIf[key].caption;
    }
  });
  return caption;
}

export function getRplModeOptions(value) {
  let rplModeOptions = [];
  if (!value) {
    Object.keys(RplMode).forEach(function (key) {
      rplModeOptions.push(<Option value={RplMode[key].name} key={RplMode[key].name}>{RplMode[key].caption}</Option>);
    });
  }
  return rplModeOptions;
}

export function getRplStepOptions(value) {
  let rplStepOptions = [];
  if (!value) {
    Object.keys(RplStep).forEach(function (key) {
      rplStepOptions.push(<Option value={RplStep[key].name} key={RplStep[key].name}>{RplStep[key].caption}</Option>);
    });
  } else {
    value.map(item => {
      rplStepOptions.push(<Option value={RplStep[item].name} key={RplStep[item].name}>{RplStep[item].caption}</Option>)
    })
  }
  return rplStepOptions;
}
export function getRplMethodOptions(value) {
  let rplMethodOptions = [];
  if (!value) {
    Object.keys(RplMethod).forEach(function (key) {
      rplMethodOptions.push(<Option value={RplMethod[key].name} key={RplMethod[key].name}>{RplMethod[key].caption}</Option>);
    });
  } else {
    value.map(item => {
      rplMethodOptions.push(<Option value={RplMethod[item].name} key={RplMethod[item].name}>{RplMethod[item].caption}</Option>);
    })
  }
  return rplMethodOptions;
}
export function getRplTypeOptions(value) {
  let rplTypeOptions = [];
  if (!value) {
    Object.keys(RplType).forEach(function (key) {
      rplTypeOptions.push(<Option value={RplType[key].name} key={RplType[key].name}>{RplType[key].caption}</Option>);
    });
  } else {
    value.map(item => {
      rplTypeOptions.push(<Option value={RplType[item].name} key={RplType[item].name}>{RplType[item].caption}</Option>);
    })
  }
  return rplTypeOptions;
}
export function getRplMethodExtendOptions(value) {
  let rplMethodExtendOptions = [];
  if (!value) {
    Object.keys(RplMethodExtend).forEach(function (key) {
      rplMethodExtendOptions.push(<Option value={RplMethodExtend[key].name} key={RplMethodExtend[key].name}>{RplMethodExtend[key].caption}</Option>);
    });
  } else {
    value.map(item => {
      rplMethodExtendOptions.push(<Option value={RplMethodExtend[item].name} key={RplMethodExtend[item].name}>{RplMethodExtend[item].caption}</Option>);
    })
  }
  return rplMethodExtendOptions;
}