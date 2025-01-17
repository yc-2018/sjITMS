import React from 'react';
import { Tooltip, Avatar } from 'antd';
import classNames from 'classnames';
import configs from '@/utils/config';
import styles from './index.less';
import { isBlank } from '@/utils/utils';


const AvatarList = ({ children, size, ...other }) => {
  const childrenWithProps = React.Children.map(children, child =>
    React.cloneElement(child, {
      size,
    })
  );

  return (
    <div {...other} className={styles.avatarList}>
      <ul> {childrenWithProps} </ul>
    </div>
  );
};

const Item = ({ src, size, tips, onClick = () => {} }) => {
  const cls = classNames(styles.avatarItem, {
    [styles.avatarItemLarge]: size === 'large',
    [styles.avatarItemSmall]: size === 'small',
    [styles.avatarItemMini]: size === 'mini',
  });

  return (
    <li className={cls} onClick={onClick}>
      {tips ? (
        <Tooltip title={tips}>
          <Avatar src={!isBlank(src)?src:configs[API_ENV]['avatar.default.url']} size={size} style={{ cursor: 'pointer' }} />
        </Tooltip>
      ) : (
        <Avatar src={!isBlank(src)?src:configs[API_ENV]['avatar.default.url']} size={size} />
      )}
    </li>
  );
};

AvatarList.Item = Item;

export default AvatarList;
