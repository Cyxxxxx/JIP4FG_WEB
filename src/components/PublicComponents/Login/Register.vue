<template>
  <div class="register">
    <el-form
      ref="ruleForm"
      :model="ruleForm"
      status-icon
      :rules="rules"
      label-width="100px"
      class="demo-ruleForm"
      label-position="left"
    >
      <!-- 邮箱 -->
      <el-form-item
        :label="$t('email')"
        prop="email"
      >
        <el-input v-model="ruleForm.email" />
      </el-form-item>

      <!-- 用户名 -->
      <el-form-item
        :label="$t('username')"
        prop="username"
      >
        <el-input
          v-model="ruleForm.username"
          :maxlength="10"
        />
      </el-form-item>

      <!-- 密码 -->
      <el-form-item
        :label="$t('password')"
        prop="password"
      >
        <el-input
          v-model="ruleForm.password"
          :maxlength="20"
          show-password
          type="password"
          autocomplete="off"
        />
      </el-form-item>

      <!-- 确认密码 -->
      <el-form-item
        :label="$t('checkPassword')"
        prop="checkPass"
      >
        <el-input
          v-model="ruleForm.checkPass"
          :maxlength="20"
          show-password
          type="password"
          autocomplete="off"
        />
      </el-form-item>

      <!-- 验证码 -->
      <!-- <el-form-item
        :label="$t('verifyCode')"
        prop="verifyCode"
      >
        <el-row
          type="flex"
          justify="space-between"
          :gutter="16"
        >
          <el-col :span="10">
            <el-input
              v-model="ruleForm.verifyCode"
              :maxlength="4"
            />
          </el-col>
          <el-col
            :span="10"
            style="height:40px;"
          >
            <img
              style="height:100%;width:100%"
              :src="`data:image/bmp;base64,${imageBase64}`"
              @click.stop="getCode"
            >
          </el-col>
        </el-row>
      </el-form-item> -->

      <!-- 注册按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          @click="submitForm('ruleForm')"
        >
          {{ $t('registered') }}
        </el-button>
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
export default {
  username: 'Register',
  components: {},
  data() {
    // 邮箱验证函数
    var checkEmail = (rule, value, callback) => {
      var pattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

      if (!value) {
        return callback(new Error('邮箱不能为空'));
      }
      if (!pattern.test(value)) { return callback(new Error('邮箱格式错误')); }
      // this.$api.user.checkEmail(value)
      //   .then(res => {
      //     if (res.status !== 200) {
      //       callback(new Error('邮箱已被注册'));
      //     }
      //   });
      callback();
    };
    // 用户名验证函数
    var checkName = (rule, value, callback) => {
      const patrn = /[`~!@#$%^&*()\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/im;
      if (!value) {
        return callback(new Error('用户名不能为空'));
      }
      if (patrn.test(value)) {
        return callback(new Error('用户名不能包含特殊字符'));
      }
      if (value.length < 4) {
        return callback(new Error('用户名应为4-10位'));
      }
      return callback()
      // this.$api.user.checkUser(value)
      //   .then(res => {
      //     if (res.status !== 200) {
      //       callback(new Error('此用户名已被注册'));
      //     } else {
      //       callback();
      //     }
      //   });
    };
    // 密码验证
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.ruleForm.checkPass !== '') {
          this.$refs.ruleForm.validateField('checkPass');
        }
        if (value.length < 8) {
          callback(new Error('密码应为8-20位'));
        }
      }
      callback();
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.ruleForm.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    // var checkCode = (rule, value, callback) => {
    //   if (value === '') {
    //     callback(new Error('请输入验证码'));
    //   } else if (value.length < 4) {
    //     callback(new Error('验证码应为4位'));
    //   } else {
    //     callback();
    //   }
    // };
    return {
      // 验证码数据
      imageBase64: null,
      // 登录加载
      loading: false,
      // 表格数据
      ruleForm: {
        password: '',
        checkPass: '',
        email: '',
        username: '',
        // verifyCode: ''
      },
      // 验证规则
      rules: {
        password: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' }
        ],
        email: [
          { validator: checkEmail, trigger: 'blur' }
        ],
        username: [
          { validator: checkName, trigger: 'blur' }
        ],
        // verifyCode: [
        //   { validator: checkCode, trigger: 'blur' }
        // ]
      }
    };
  },
  computed: {},
  watch: {},
  mounted() {
    // this.getCode();
  },
  methods: {
    // 获取验证码
    // getCode() {
    //   this.$api.user.verificationCode()
    //     .then(res => {
    //       const { data: { data }} = res;
    //       this.imageBase64 = data.imageBase64;
    //       this.vid = data.vid;
    //     });
    // },
    // 表单提交
    submitForm(formName) {
      console.log("submit!")
      try {
        this.$refs[formName].validate((valid) => {
          console.log(valid)
          if (valid) {
            this.register();
          } else {
            console.log('error submit!!');
            return false;
          }     
        });   
      } catch (error) {
        console.error(error)
      }
    },
    // 重置数据
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    // 登录
    register() {
      console.log("rr")
      const reqBody = {
        userInfo: {
          username: this.ruleForm.username.trim(),
          email: this.ruleForm.email,
          password: this.ruleForm.password
        },
        // vid: this.vid,
        // value: this.ruleForm.verifyCode
      };
      this.$api.user.register(reqBody)
        .then(res => {
          if (res.status === 200) {
            this.$message.success(res.data.msg);
            location.reload();
          } else {
            this.$message.closeAll();
            this.$message.info(res.data.msg);
          }
        })
        .catch(err => {
          console.error(err);
        });
      this.loading = false;
      // this.getCode();
    }
  }
};
</script>

<style scoped lang="less">

.register{}
</style>
