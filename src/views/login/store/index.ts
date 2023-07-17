// 引入依赖的库
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import jwtDecode from 'jwt-decode';
import { login } from '../server';
interface Iuse {
  password: string;
  studentID: string;
}
interface Iuser2 {
  username: string;
  power: number;
  id: number;
}
export const fetchlogin = createAsyncThunk('user/login', async (args: Iuse, { dispatch }) => {
  const { password, studentID } = args;
  try {
    const res = await login(password, studentID);
    localStorage.setItem('ZXtoken', res.data);
    const userinfo = jwtDecode(res.data);
    dispatch(changeuser(userinfo));
    return {
      code: 200,
      msg: '登录成功'
    };
  } catch (error) {
    console.log(error);
    return {
      code: 500,
      msg: '登录失败'
    };
  }
});
// 创建 counterSlice
export const userSlice = createSlice({
  name: 'user', // slice 名称
  initialState: {
    // 初始化 state
    username: '张三', // 姓名
    power: 1000, // 年龄
    id: 1
  },
  reducers: {
    changeuser(state, { payload }) {
      const { username, power, id }: Iuser2 = { ...payload };
      state.id = id;
      state.username = username;
      state.power = power;
    }
  } // 定义 reducer 函数
});
// 通过 createSlice 自动生成的 action creators，对应 reducers 中的每一个函数
// 在这里没有定义具体的 reducer 函数，因此没有生成对应的 action creators
export default userSlice.reducer;
export const { changeuser } = userSlice.actions;
