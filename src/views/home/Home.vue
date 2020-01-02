<template>
  <el-container class="container--home">
    <el-header style="height: 80px;">
      <div>
        <img class="container--home_logo" src="../../assets/img/avatar.jpg" alt="logo">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="this.isMenuCollapse ? '64px' : '200px'">
        <div class="toggle--menu" @click="toggleMenu">|||</div>
        <el-menu
          class="container--home_aside"
          background-color="#333744"
          text-color="#fff"
          unique-opened
          :collapse="isMenuCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activeItem"
        >
          <el-submenu v-for="item in menuList" :key="String(item.id)" :index="String(item.id)">
            <template slot="title">
              <i :class="iconClass[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item @click="active('/' + subItem.path)" v-for="subItem in item.children" :key="String(subItem.id)" :index="'/' + subItem.path">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      menuList: [],
      iconClass: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isMenuCollapse: false,
      activeItem: ''
    }
  },
  created () {
    this.getMenu()
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenu () {
      const { data: result } = await this.$http.get('/menus')
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
      this.menuList = result.data
      console.log(result)
    },
    toggleMenu () {
      this.isMenuCollapse = !this.isMenuCollapse
    },
    //  激活点击效果
    active (index) {
      this.activeItem = index
    }
  }
}
</script>

<style lang="scss" scoped>
  .container--home {
    height: 100%;
    .container--home_logo {
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }
  }

  .el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #373d41;
    > div {
      display: flex;
      align-items: center;
      color: #fff;
      font-size: 20px;
      > span {
        margin-left: 15px;
      }
    }
  }

  .el-aside {
    background-color: #333744;
    .toggle--menu {
      padding: 5px 0;
      text-align: center;
      color: #fff;
      cursor: pointer;
      min-width: 0;
    }
    .el-main {
      background-color: #eaedf1;
    }
    .el-menu {
      border-right: none;
    }
  }
  .iconfont {
    margin-right: 8px;
  }
</style>
