export const binState = {
  FREE: {
    name: 'FREE',
    caption: '空闲'
  },
  LOCKED: {
    name: 'LOCKED',
    caption: '锁定'
  },
  CLOSELOCKED: {
    name: 'CLOSELOCKED',
    caption: '封仓锁定'
  },
  EXCEPITON: {
    name: 'EXCEPITON',
    caption: '异常'
  },
  USING: {
    name: 'USING',
    caption: '使用中'
  },
  RTNPUTAWAYLOCKED: {
    name: 'RTNPUTAWAYLOCKED',
    caption: '退仓上架异常锁定'
  }
}

export function getStateCaption(state) {
  let caption;

  for (let x in binState) {
    if (binState[x].name === state) {
      caption = binState[x].caption;
      break;
    }
  }

  return caption;
}