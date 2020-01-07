<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', 'vtCenter', index === 0 ? 'bdtop' : '']" v-for="(item, index) in scope.row.children" :key="item.id">
              <el-col :span="5">
                <el-tag closable
                    @close="removeRightById(scope.row, item.id)">{{ item.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row :class="['vtCenter', index === 0 ? '' : 'bdtop']" v-for="(subItem, index) in item.children" :key="subItem.id">
                  <el-col :span="6">
                    <el-tag
                    type="success"
                    closable
                    @close="removeRightById(scope.row, subItem.id)"
                    >{{ subItem.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                    type="warning"
                    v-for="(item3) in subItem.children"
                    :key="item3.id"
                    closable
                    @close="removeRightById(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" prop="level" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button type="danger" size="mini" icon="el-icon-delete"
              >删除</el-button
            >
            <el-button
            type="warning"
            size="mini" icon="el-icon-setting"
            @click="showSetRightDialog(scope.row)"
            >
            分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="clearDfKeys">
      <el-tree
      :data="rightsList"
      :props="rightsListProps"
      show-checkbox
      default-expand-all
      node-key="id"
      :default-checked-keys="rightsListDfKeys"
      ref="rightsListRef"
      ></el-tree>
      <span slot="footer">
        <el-button @click="setRightDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRightsChange">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'roles',
  data () {
    return {
      roleList: [],
      setRightDialogVisible: false,
      //  所有权限的数据
      rightsList: [],
      rightsListProps: {
        label: 'authName',
        children: 'children'
      },
      //  权限列表默认勾选项
      rightsListDfKeys: [],
      curRoleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async submitRightsChange () {
      const keys = [
        ...this.$refs.rightsListRef.getCheckedKeys(),
        ...this.$refs.rightsListRef.getHalfCheckedKeys()
      ]
      const keyStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${Number(this.curRoleId)}/rights`, { rids: keyStr })
      if (res.meta.status !== 200) {
        console.log(res)
        return this.$message.error('更新权限失败')
      }
      this.$message.success('更新权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    //  监听弹框关闭事件清空数组
    clearDfKeys () {
      this.rightsListDfKeys = []
    },
    //  通过递归的形式拿到所有对应角色下所有三级权限id
    getDfKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(element => {
        this.getDfKeys(element, arr)
      })
    },
    async showSetRightDialog (role) {
      //  保存当前打开的用户id，以备修改后提交
      this.curRoleId = role.id

      const { data: res } = await this.$http.get('rights/tree')

      if (res.meta.status !== 200) {
        return this.$message.error('获取权限失败')
      }

      this.rightsList = res.data
      //  拿到当前角色权限列表
      this.getDfKeys(role, this.rightsListDfKeys)

      this.setRightDialogVisible = true
    },
    //  根据ID删除权限
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限，是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      //  发起删除请求
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      //  因为接口返回的就是最新的权限列表数据，所以不用再重新请求刷新列表
      role.children = res.data
    },
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
    }
  }
}
</script>

<style lang="scss" scoped></style>
