<template>
  <div>
    <el-card>
      <el-row>
        <el-col :span="6">
          <!--搜索与添加区域-->
          <el-input v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="编辑">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <el-button content="删除" type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <el-button @click="setRole(scope.row)" content="分配角色" type="warning" icon="el-icon-setting" size="mini"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--      分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!--    新增用戶對話框-->
    <el-dialog
      title="添加用戶"
      :visible.sync="dialogVisible"
      width="30%"
      @close="dialogClose"
    >
      <el-form :model="newUserForm"
               :rules="newUserFormRules"
               ref="newUserFormRef"
               label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="newUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="newUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="newUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="newUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button @click="addNewUser('newUserFormRef')" type="primary">确 定</el-button>
      </span>
    </el-dialog>

<!--    修改用户对话框-->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%">
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
        @close="editDialogClose"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button @click="submitEditeUserForm('editFormRef')" tyep="primary">确定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配角色"
  :visible.sync="setRoleDialogVisible"
  width="50%" @close="clearSelected">
  <div>
    <p>当前的用户：{{userInfo.username}}</p>
    <p>当前的角色：{{userInfo.role_name}}</p>
    <p>分配新角色：
      <el-select v-model="selectedRoleId" placeholder="请选择">
        <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
      </el-select>
    </p>
  </div>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data () {
    const checkMobile = (rule, value, callback) => {
      setTimeout(() => {
        if (value.toString().length <= 6) {
          return callback(new Error('手机长度不合法'))
        } else {
          callback()
        }
      }, 1000)
    }
    const checkMail = (rule, value, callback) => {
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      setTimeout(() => {
        if (regEmail.test(value)) {
          callback()
        } else {
          callback(new Error('请输入合法的邮箱'))
        }
      }, 1000)
    }
    return {
      //  控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      userList: [],
      total: 0,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      editForm: {},
      editDialogVisible: false,
      dialogVisible: false,
      newUserForm: {
        username: 'abc',
        password: '123',
        email: '123@qw.cn',
        mobile: '12345678912'
      },
      editFormRules: {
        email: [
          { required: true, message: '必填项', trigger: 'blur' },
          { validator: checkMail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '必填项', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      newUserFormRules: {
        username: [
          { required: true, message: '必填项', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3-10之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '必填项', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3-10之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '必填项', trigger: 'blur' },
          { validator: checkMail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '必填项', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      //  需要被分配角色的用户信息
      userInfo: {},
      //  所有角色的数据列表
      rolesList: [],
      //  已选中的角色Id值
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    //  监听分配角色对话框的关闭事件并清空数据
    clearSelected () {
      this.selectedRoleId = ''
      this.userList = {}
    },
    //  提交角色修改
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('更新失败')
      }
      // console.log(res)
      this.$message.success('更新角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    //  显示分配角色对话框
    async setRole (userInfo) {
      this.userInfo = userInfo

      //  展示对话框前获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      console.log(res)
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    //  删除用户
    removeUserById (id) {
      this.$confirm('此操作将永久删除用户，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`users/${id}`).then((res) => {
          this.getUserList()
          this.$message.success('删除成功')
        }).catch((e) => {
          this.$message.error('e')
        })
      }).catch((res) => {
        this.$message.info('已取消删除')
      })
    },
    submitEditeUserForm (ref) {
      this.$refs[ref].validate((valid) => {
        // if (valid) console.log(valid)
        if (!valid) return this.$message.error('非法数据格式')
        this.$http.put(`users/${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        }).then((data) => {
          const res = data.data
          if (res.meta.status !== 200) return this.$message.error('失败')
          this.$message.success('成功修改')
        }).catch(() => {
          this.$message.error('失败')
        })
        this.editDialogVisible = false
        this.getUserList()
      })
    },
    editDialogClose () {
      this.$refs.editDialogRef.resetField()
    },
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error('查询失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    addNewUser (ref) {
      this.$refs[ref].validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('users', this.newUserForm)
          if (res.meta.status !== 201) return this.$message.error('添加用户失败')
          this.$message.success('添加用户成功')
          this.dialogVisible = false
          this.getUserList()
        } else {
          return this.$message.error('数据校验错误')
        }
      })
    },
    dialogClose () {
      this.$refs.newUserFormRef.resetFields()
    },
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
      // console.log(res)
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async userStateChange (userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新状态失败')
      }
      this.$message.success('更新状态成功')
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-input {
    vertical-align: top;
  }

  .el-col {
    margin-right: 20px;
  }

  .el-table {
    margin-top: 15px;
    font-size: 12px;
  }
</style>
