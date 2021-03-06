<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <tree-table
            :data="cateList"
            :columns="cateListTitle"
            :selection-type="false"
            :expand-type="false"
            show-index
            index-text="#"
            border
          >
            <template slot="isok" slot-scope="scope">
              <i style="color: lightgreen" class="el-icon-success" v-if="scope.row.car_deleted === false"></i>
              <i style="color: red" class="el-icon-error" v-else></i>
            </template>
            <!--            排序-->
            <template slot="order" slot-scope="scope">
              <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
              <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
              <el-tag size="mini" type="warning" v-else>三级</el-tag>
            </template>
            <!--            操作-->
            <template slot="opt">
              <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini">编辑</el-button>
            </template>
          </tree-table>

          <!--          分页区域-->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[3, 5, 10, 15]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </el-col>
      </el-row>
    </el-card>

    <!--    添加分类的对话框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
    >
      <!--      添加分类表单-->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            change-on-select
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="handleParentCateListChange" clearable change-on></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitListChange">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'category',
  data () {
    return {
      //  选中的父级分类id数组
      selectedKeys: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //  添加分类对话框中的商品一二级分类
      parentCateList: [],
      //  添加分类的表单验证规则对象
      addCateFormRules: {
        cat_name: [
          {
            required: true, message: '请输入分类名称', trigger: 'blur'
          }
        ]
      },
      //  添加分类的表单数据对象
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      //  控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      //  获取商品分类列表的参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //  商品分类的数据列表，默认为空
      cateList: [],
      //  商品分类总条数
      total: 0,
      //  表格每列标题
      cateListTitle: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          //  将当前列定义为模板列
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ]
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    //  添加分类框的提交事件
    submitListChange () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('修改失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    handleParentCateListChange () {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败')
      }
      this.parentCateList = res.data
    },
    //  点击按钮显示添加分类对话框
    showAddCateDialog () {
      //  获取父级分类列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    //  监听pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //  监听 pagenum 改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    //  初始化获取商品分类列表数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-cascader {
    width: 100%;
  }
</style>
