import Layout, { Content, Header } from 'antd/lib/layout/layout';
import Sider from 'antd/lib/layout/Sider';
import { observer } from 'mobx-react';
import React from 'react';
import SidePanel from '../sidePanel';
import TopMenu from '../topMenu/index3D';
import './style.css';

const Template = observer(({ children }) => {
  return (
    <>
      <Layout>
        <Header>
          <TopMenu />
        </Header>
        <Content>{children}</Content>
      </Layout>
    </>
  );
});

export default Template;
