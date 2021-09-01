/**状态 */
export const State = {
  SHIPED : {
    name: 'SHIPED ',
    caption: '已装车',
    color: '#2DCB38'
  },
  SHIPPING : {
    name: 'SHIPPING ',
    caption: '装车中',
    color: '#2DCB38'
  },
  DELIVERING: {
    name: 'DELIVERING',
    caption: '配送中',
    color: '#2DCB38'
  },
  RETURNED: {
    name: 'RETURNED',
    caption: '已回车',
    color: '#3B77E3'
  },
  FINISHED: {
    name: 'FINISHED',
    caption: '已完成',
    color: '#D8DAE6'
  },
  SHIPED: {
    name: 'SHIPED',
    caption: '已装车',
    color: '#D8DAE6'
  },
  ABORTEDAFTERSHIPED: {
    name: 'ABORTEDAFTERSHIPED',
    caption: '装车后作废'
  }
}

export const WorkType = {
  DRIVER: {
    name: 'DRIVER',
    caption: '驾驶员'
  },
  STEVEDORE: {
    name: 'STEVEDORE',
    caption: '装卸员'
  }
}

export function getStateCaption(name) {
  let caption;
  Object.keys(State).forEach(function (key) {
    if (State[key].name === name)
      caption = State[key].caption;
  });
  return caption;
}

