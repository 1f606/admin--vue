<template>
  <div class="login">
    <div class="login-container">
      <div class="login-container_box">
        <img class="login-container_avatar" src="../../assets/img/avatar.jpg" alt="logo">
        <el-form :model="loginForm" ref="loginForm" label-width="70px" class="login-container_form" :rules="rules">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="submitForm('loginForm')" class="login-container_btn" type="primary">登录</el-button>
            <el-button @click="resetForm('loginForm')" class="login-container_btn" type="info">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm (formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) {
          alert('error')
        } else {
          const { data: result } = await this.$http.post('/login', this.loginForm)
          console.log(result)
          if (result.meta.status === 200) {
            this.$message.success('登录成功')
            window.sessionStorage.setItem('token', result.data.token)
            this.$router.push('/home')
          } else {
            this.$message.error('登录失败')
          }
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
  .login{
    height: 100%;
    width: 100%;
    background-color: #2b4b6b;
    .login-container {
      width: 500px;
      height: 300px;
      background-color: #787eac;
      border-radius: 3px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      .login-container_box {
        position: relative;
        height: 100%;
        width: 100%;
        .login-container_avatar {
          position: absolute;
          top: -75px;
          left: 175px;
          width: 150px;
          height: 150px;
          border-radius: 50%;
        }
        .login-container_form {
          position: absolute;
          bottom: 0;
          box-sizing: border-box;
          width: 100%;
          padding: 0 20px;
          .login-container_btn {
            margin-left: 70px;
          }
        }
      }
    }
  }
</style>

<style lang="scss">
  .login-container_box .el-form-item__label {
    color: #333;
  }
</style>
