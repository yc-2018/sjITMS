/**状态 */
export const State ={
    SAVED: {
        name: 'SAVED',
        caption: '已保存'
    },
    INPROGRESS: {
      name: 'INPROGRESS',
      caption: '进行中'
    },
    AUDITED: {
      name: 'AUDITED',
      caption: '已审核'
    }
}

export const SettleUnit = {
  QTY: {
    name: 'QTY',
    caption: '数量'
  },
  WEIGHT: {
    name: 'WEIGHT',
    caption: '重量'
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

