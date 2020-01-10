<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
      </el-breadcrumb>

      <el-card>
<!--        警告-->
        <el-alert show-icon title="注意：只允许为第三级分类设置参数" type="warning" closable></el-alert>

<!--        选择商品分类区域-->
        <el-row>
          <el-col>
            <span>选择商品分类：</span>
            <el-cascader
              v-model="selectedKeys"
              :options="cateList"
              :props="cateListProps"
              @change="handleCateListChange"></el-cascader>
          </el-col>
        </el-row>
        <el-tabs v-model="activeName" @tab-click="handleTabClick" type="border-card">
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">动态参数</el-button>
<!--          动态参数表格-->
            <el-table :data="manyTableData" border stripe>
              <el-table-column type="expand">
                <template slot-scope="scope">
<!--                  循环渲染tag标签-->
                  <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index, scope.row)">{{item}}</el-tag>
                  <el-input
                  class="input--newTag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else size="small" @click="showInput(scope.row)">
                    New Tag
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="primary" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled"  @click="addDialogVisible = true">静态属性</el-button>
            <!--          静态参数表格-->
            <el-table :data="onlyTableData" border stripe>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!--                  循环渲染tag标签-->
                  <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable>{{item}}</el-tag>
                  <el-input
                    class="input--newTag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else size="small" @click="showInput(scope.row)">
                    New Tag
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="primary" size="mini" icon="el-icon-delete">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
<!--      添加参数的对话框-->
      <el-dialog
        :title="dialogTitle"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
      >
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="dialogTitle" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitParams">确定</el-button>
        </span>
      </el-dialog>

      <!--      修改参数的对话框-->
      <el-dialog
        :title="'修改' + dialogTitle"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="dialogTitle" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditParams">确定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'params',
  data () {
    return {
      cateList: [],
      cateListProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [],
      //  被激活的页签的名称
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      addForm: {},
      addFormRules: {
        attr_name: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ]
      },
      //  控制修改参数对话框的显示与隐藏
      editDialogVisible: false,
      //  修改参数的保单验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ]
      },
      editForm: {}
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    dialogTitle () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    },
    isBtnDisabled () {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    curCateId () {
      return this.selectedKeys[2]
    }
  },
  methods: {
    //  删除参数可选项
    handleClose (index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    },
    //  点击按钮，展示本文输入框
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    //  文本框失去焦点，或按下enter都会触发
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //  保存输入框数据
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      this.saveAttrVals(row)
    },
    //  将对 attr_vals的操作保存到数据库中
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.curCateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }

      this.$message.success('修改参数项成功')
    },
    //  根据id删除
    async removeParams (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        // eslint-disable-next-line handle-callback-err
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消')
      }
      const { data: res } = await this.$http.delete(`categories/${this.curCateId}/attributes/${id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('错误')
      }

      this.$message.success('删除成功')
      this.getParamsData()
    },
    submitEditParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.curCateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 200) {
          return this.$message.error('错误')
        }

        this.$message.success('修改成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    //  关闭后清空表单数据
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    //  点击按钮，展示修改的对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`categories/${this.curCateId}/attributes/${id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('错误')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //  添加参数的提交
    submitParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.curCateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('错误')
        }

        this.$message.success('添加成功')
        this.addCateDialogVisible = false
        this.getParamsData()
      })
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    //  tabs点击事件
    handleTabClick () {
      this.getParamsData()
    },
    //  获取参数的列表数据
    async getParamsData () {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      //  根据所选分类id和当前所处面板，获取对应参数
      // console.log(this.curCateId)
      const { data: res } = await this.$http.get(`categories/${this.curCateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('错误')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    handleCateListChange () {
      this.getParamsData()
    },
    async getCateList () {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('错误')
      }

      this.cateList = res.data
    }
  }
}
</script>

<style lang="scss" scoped>
  .input--newTag {
    width: 110px;
  }
</style>
