import React, { memo } from 'react';
import type { FC, ReactNode } from 'react';
interface IProps {
  children?: ReactNode;
}

const Login: FC<IProps> = () => {
  return <div>我是User</div>;
};
export default memo(Login);
