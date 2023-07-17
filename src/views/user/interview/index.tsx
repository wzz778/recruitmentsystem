import React, { memo, useState, useEffect, useCallback } from 'react';
import type { FC, ReactNode } from 'react';
import type { PaginationProps } from 'antd';
import { Table, Pagination, Button, Space, Form, Input, Radio, message, Modal, Select } from 'antd';
import {
  SearchOutlined,
  PlusSquareOutlined,
  QuestionCircleOutlined,
  MinusSquareOutlined
} from '@ant-design/icons';
import {
  allInterviewPage,
  QuestionAdd,
  interviewStatusUpload,
  deleteQuestion,
  randomQuestion
} from '@/service/modules/user';
interface IProps {
  children?: ReactNode;
}
export interface interviewType {
  id: number;
  question: string;
  answer: string;
  questionBankType: number;
}
const showTotal: PaginationProps['showTotal'] = (total) => `共 ${total} 页`;
const Interview: FC<IProps> = () => {
  const [openUpload, setUploadOpen] = useState(false);
  const [openRandom, setOpenRandom] = useState(false);
  function statusToCh(num: number) {
    switch (num) {
      case 0:
        return '待笔试';
      case 1:
        return '笔试未通过';
      case 2:
        return '待面试';
      case 3:
        return '进入二面';
      case 4:
        return '进入三面';
      case 5:
        return '已录取';
      default:
        return '面试未通过';
    }
  }
  const columns: Array<any> = [
    {
      title: '姓名',
      width: 50,
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '学号',
      width: 70,
      dataIndex: 'studentId',
      key: 'studentId'
    },
    {
      title: '班级',
      width: 50,
      dataIndex: 'claas',
      key: 'claas'
    },
    {
      title: '性别',
      width: 40,
      dataIndex: 'sex',
      key: 'sex',
      render: (_: any, { sex }: any) => <>{sex == 1 ? '男' : '女'}</>
    },
    {
      title: '报名时间',
      width: 60,
      dataIndex: 'createTime',
      key: 'createTime'
    },
    {
      title: '状态',
      width: 100,
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => <>{statusToCh(status)}</>
    },
    {
      title: '操作',
      key: 'operation',
      fixed: 'right',
      dataIndex: 'key',
      width: 100,
      render: (_: any, record: any) => (
        <Space size="middle">
          <a onClick={() => onUserDelete(record)}>刪除</a>
        </Space>
      )
    }
  ];
  const onUserRevise = (data: any) => {
    setUploadOpen(true);
    const { id, answer, question, typeId, questionBankType } = data;
    formUpload.setFieldsValue({
      id,
      answer,
      question,
      typeId,
      questionBankType
    });
  };
  const onUserDelete = (data: any) => {
    setopenConfirm(true);
    setdeleteForm({ id: data.id, question: data.question });
  };
  const [messageApi, contextHolder] = message.useMessage();
  const [listdata, setlistdata] = useState<interviewType[]>([]);
  const [pagination, setpagination] = useState({ pageNum: 1, pageSize: 5 });
  const [total, setTotal] = useState(20);
  const [searchForm, setsearchForm] = useState({
    questionBankType: 1,
    typeId: ''
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };
  const getUserCb = useCallback(
    () => allInterviewPage({ ...pagination, ...searchForm }),
    [pagination, searchForm]
  );
  useEffect(() => {
    getUserCb()
      .then((res) => {
        console.log(res);
        setlistdata(res.data.records);
        setTotal(res.data.total);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [getUserCb]);
  const onChange: PaginationProps['onChange'] = (pageNumber) => {
    setpagination({ pageSize: 5, pageNum: pageNumber });
  };
  const [form] = Form.useForm();
  const [formRandom] = Form.useForm();

  const invform = {
    questionBankType: 1,
    typeId: ''
  };
  const addInvForm = {
    questionBankType: 1,
    typeId: 1
  };
  const [formADD] = Form.useForm();
  const [formUpload]: any = Form.useForm();
  const onReset = () => {
    form.resetFields();
  };
  const onFinish = (values: any) => {
    onReset();
    if (values.time) {
      setsearchForm({
        questionBankType: values.questionBankType,
        typeId: values.typeId
      });
    } else {
      setsearchForm({
        questionBankType: values.questionBankType,
        typeId: values.typeId
      });
    }
  };
  const onAddOk = async () => {
    try {
      const values = await formADD.validateFields();
      const res = await QuestionAdd(values);
      if (res.status == 200) {
        setpagination({ ...pagination });
        message.success('添加成功！');
        setOpenADD(false);
        formADD.resetFields();
      } else {
        message.error('添加失败！');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };
  const onRandomOk = async () => {
    try {
      const values = await formRandom.validateFields();
      const res = await randomQuestion({ typeId: values.typeId });
      if (res.status == 200) {
        message.success('生成成功！');
        const { answer, question } = res.data;
        const questionBankType = res.data.questionBankType ? '笔试' : '面试';
        formRandom.setFieldsValue({
          answer,
          question,
          questionBankType
        });
      } else {
        message.error('生成失败！');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };
  const onUploadOk = async () => {
    try {
      const values = await formUpload.validateFields();
      const res = await interviewStatusUpload(values);
      if (res.status == 200) {
        setpagination({ ...pagination });
        message.success('修改成功！');
        setUploadOpen(false);
        formUpload.resetFields();
      } else {
        message.error('修改失败！');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };
  //打开添加框
  const [openADD, setOpenADD] = useState(false);
  const validateMessages = {
    required: '请填写您要添加的${label}!',
    types: {
      email: '$您输入的{label}不合理 ! ',
      number: '$您输入的{label}不合理 ! ',
      string: '$您输入的{label}不合理 !'
    },
    number: {
      range: '${label} must be between ${min} and ${max}'
    },
    string: {
      range: '${label} 应该在 ${min} 到 ${max} 之间'
    }
  };

  const deleteIDFn = async () => {
    try {
      const ids =
        deleteForm.id == 0
          ? selectedRowKeys.map((id) => `ids=${id}`).join('&')
          : `ids=${deleteForm.id}`;
      const res = await deleteQuestion(ids);
      if (res.status == 200) {
        setpagination({ ...pagination });
        messageApi.open({
          type: 'success',
          content: '删除成功！'
        });
        setopenConfirm(false);
      } else {
        message.error('删除失败！');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };
  const [openConfirm, setopenConfirm] = useState(false);
  const [deleteForm, setdeleteForm] = useState({ id: 1, question: '啊' });
  return (
    <div>
      {contextHolder}
      <Modal
        title="Modal"
        open={openConfirm}
        onOk={deleteIDFn}
        onCancel={() => setopenConfirm(false)}
        okText="确认"
        cancelText="取消"
      >
        <p>
          你确认删除 <span style={{ color: '#1677FF' }}>{deleteForm.question}</span> 的问题信息吗？
        </p>
      </Modal>
      <Modal
        title="添加问题"
        centered
        open={openADD}
        onOk={onAddOk}
        onCancel={() => setOpenADD(false)}
        width={400}
        cancelText="取消"
        okText="添加"
      >
        <Form
          layout="horizontal"
          form={formADD}
          size="large"
          style={{ marginBottom: '10px' }}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 14 }}
          validateMessages={validateMessages}
          name="addFormName"
          initialValues={addInvForm}
        >
          <Form.Item
            label="问题"
            name="question"
            rules={[{ required: true }, { type: 'string', min: 2, max: 100 }]}
          >
            <Input.TextArea placeholder="请填写问题" style={{ minWidth: '250px' }} />
          </Form.Item>
          <Form.Item
            label="回答"
            name="answer"
            rules={[{ required: true }, { type: 'string', min: 2, max: 100 }]}
          >
            <Input.TextArea placeholder="请填写回答" style={{ minWidth: '250px' }} />
          </Form.Item>
          <Form.Item label="类别" name="questionBankType">
            <Select>
              <Select.Option value={0}>笔试</Select.Option>
              <Select.Option value={1}>面试</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="类型" name="typeId">
            <Select></Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="修改问题信息"
        centered
        open={openUpload}
        onOk={onUploadOk}
        onCancel={() => setUploadOpen(false)}
        width={400}
        cancelText="取消"
        okText="修改"
      >
        <Form
          layout="horizontal"
          form={formUpload}
          size="large"
          style={{ marginBottom: '10px' }}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 14 }}
          validateMessages={validateMessages}
          name="uploadFormName"
        >
          <Form.Item style={{ display: 'none' }} label="id" name="id">
            <Input />
          </Form.Item>
          <Form.Item
            label="问题"
            name="question"
            rules={[{ required: true }, { type: 'string', min: 2, max: 100 }]}
          >
            <Input.TextArea placeholder="请填写问题" style={{ minWidth: '250px' }} />
          </Form.Item>
          <Form.Item
            label="回答"
            name="answer"
            rules={[{ required: true }, { type: 'string', min: 2, max: 100 }]}
          >
            <Input.TextArea placeholder="请填写回答" style={{ minWidth: '250px' }} />
          </Form.Item>
          <Form.Item label="类别" name="questionBankType">
            <Select>
              <Select.Option value={0}>笔试</Select.Option>
              <Select.Option value={1}>面试</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="类型" name="typeId">
            <Select></Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="随机一题"
        centered
        open={openRandom}
        onOk={onRandomOk}
        onCancel={() => setOpenRandom(false)}
        width={400}
        cancelText="取消"
        okText="点击生成随机一题"
      >
        <Form
          layout="horizontal"
          form={formRandom}
          size="large"
          style={{ marginBottom: '10px' }}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          validateMessages={validateMessages}
          name="randomFormName"
        >
          <Form.Item label="问题" name="question">
            <Input.TextArea readOnly style={{ minWidth: '250px' }} />
          </Form.Item>
          <Form.Item label="回答" name="answer">
            <Input.TextArea readOnly style={{ minWidth: '250px' }} />
          </Form.Item>

          <Form.Item label="类别" name="questionBankType">
            <Input readOnly style={{ width: '250px' }} />
          </Form.Item>
          <Form.Item label="类型" name="typeId" extra="注意：可根据所选的类型进行分类">
            <Select style={{ width: '250px' }}></Select>
          </Form.Item>
        </Form>
      </Modal>
      <Form
        layout="inline"
        form={form}
        style={{ margin: '0 0 10px 10px' }}
        onFinish={onFinish}
        initialValues={invform}
      >
        <Form.Item label="类别" name="typeId" style={{ width: '200px' }}>
          <Select>
            <Select.Option value={0}>比赛</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            style={{ marginRight: '10px' }}
            icon={<SearchOutlined />}
            htmlType="submit"
          >
            搜索
          </Button>
          <Button
            onClick={() => setOpenADD(true)}
            style={{ backgroundColor: '#0DD068', marginRight: '10px' }}
            type="primary"
            icon={<PlusSquareOutlined />}
          >
            添加
          </Button>
          <Button
            onClick={() => {
              setopenConfirm(true);
              setdeleteForm({ id: 0, question: '所选问题' });
            }}
            danger
            disabled={selectedRowKeys.length == 0}
            style={{ marginRight: '10px' }}
            type="primary"
            icon={<MinusSquareOutlined />}
          >
            批量删除
          </Button>
          <Button
            onClick={() => setOpenRandom(true)}
            style={{ backgroundColor: '#0DD068' }}
            type="primary"
            icon={<QuestionCircleOutlined />}
          >
            随机一题
          </Button>
        </Form.Item>
      </Form>
      <Table
        columns={columns}
        bordered
        dataSource={listdata}
        pagination={false}
        rowKey={(listdata) => listdata.id}
        rowSelection={rowSelection}
        scroll={{
          x: '100%'
        }}
      />
      <Pagination
        style={{ float: 'right', padding: '10px 20px' }}
        defaultCurrent={1}
        total={total}
        showQuickJumper
        pageSize={pagination.pageSize}
        current={pagination.pageNum}
        showTotal={showTotal}
        onChange={onChange}
      />
    </div>
  );
};

export default memo(Interview);
