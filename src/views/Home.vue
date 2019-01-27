<template>
    <div class="home">
        <el-button style="position: fixed;right: 20%;top:5px;" size="small" @click="showDialog=true">注册 | 登录</el-button>
        <h2 class="primary-text">上月结余：<span style="color: #F56C6C;">{{lastMonthSurplus}}</span></h2>
        <h2 class="primary-text">本月累积：<span style="color: #67C23A;">{{thisMonthSurplus}}</span></h2>
        <div>
            <el-date-picker
                    v-model="date"
                    align="right"
                    type="date"
                    placeholder="选择加班日期"
                    :picker-options="pickerOptions">
            </el-date-picker>
            <el-input class="input-num" v-model="hours" placeholder="请输入小时数" type="number" max="12" min="1">
                <template slot="append">小时</template>
            </el-input>
            <el-button type="primary" @click="overtimes(hours)" :disabled="isGuest">提 交</el-button>
        </div>
        <div style="margin: 30px 0;">
            <el-button v-for="(s,k) in quickSubmits" :key="k" @click="overtimes(s)" :disabled="isGuest">提交{{s}}小时
            </el-button>
        </div>

        <div style="border-bottom: #f5f7fa 3px solid;margin: 40px 0;"></div>
        <el-input class="input-num" v-model="hours" placeholder="请输入小时数" type="number" max="12" min="1">
            <template slot="append">小时</template>
        </el-input>
        <el-button type="primary" @click="verification(hours)" :disabled="isGuest">核 销</el-button>
        <el-button v-for="(s,k) in [2,4,8]" :key="k" @click="verification(s)" :disabled="isGuest">核销{{s}}小时
        </el-button>

        <el-dialog :visible.sync="showDialog" width="40%">
            <div class="el-form-item">
                <el-input v-model="user" placeholder="用户名" maxlength="20" minlength="1"></el-input>
            </div>
            <div class="el-form-item">
                <el-input v-model="pwd" placeholder="密码，非必填" maxlength="20"></el-input>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="getToken('register')">注 册</el-button>
                <el-button type="primary" @click="getToken('login')">登 录</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import {Button, Input, DatePicker, MessageBox, Dialog} from 'element-ui'
    import {auth, setOvertime, surplus} from "../api";

    export default {
        name: 'home',
        data: function () {
            return {
                user: '',
                pwd: '',
                hours: 1,
                verificationHours: 0,
                date: new Date(),
                showDialog: false,
                lastMonthSurplus: 0,
                thisMonthSurplus: 0,
                quickSubmits: [2, 3, 4, 8],
                pickerOptions: {
                    disabledDate(time) {
                        let date = new Date();
                        date.setDate(1);
                        return time.getTime() > Date.now() || time.getTime() < date.getTime() - 3600 * 1000 * 24;
                    },
                    shortcuts: [
                        {
                            text: '昨天',
                            onClick(picker) {
                                const date = new Date();
                                date.setTime(date.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', date);
                            }
                        }, {
                            text: '前天',
                            onClick(picker) {
                                const date = new Date();
                                date.setTime(date.getTime() - 3600 * 1000 * 24 * 2);
                                picker.$emit('pick', date);
                            }
                        }]
                }
            }
        },
        computed: {
            isGuest: () => {
                return !localStorage.getItem('token');
            }
        },
        components: {
            ElButton: Button,
            ElInput: Input,
            ElDatePicker: DatePicker,
            ElDialog: Dialog
        },
        created() {
            if (!localStorage.getItem('token')) {
                this.showDialog = true;
            } else {
                this.getSurplus();
            }
        },
        methods: {
            async getToken(option) {
                try {
                    let params = {user: this.user, password: this.pwd};
                    if (this.pwd === '' && option === 'register') {
                        delete params.password;
                    }
                    let res = await auth(params, option);
                    localStorage.setItem('token', res.data.token);
                    this.showDialog = false;
                    this.getSurplus();
                } catch (e) {
                    if (e.response) {
                        MessageBox.alert(e.response.data.msg);
                        console.error(e.response.data.msg)
                    }
                }
            },
            async overtimes(hours) {
                try {
                    await setOvertime({
                        hours,
                        timestamp: this.date.getTime() / 1000
                    });
                    this.getSurplus();
                } catch (e) {
                    console.error(e)
                }
            },
            async getSurplus() {
                let res = await surplus();
                this.lastMonthSurplus = res.lastMonthSurplus;
                this.thisMonthSurplus = res.thisMonthSurplus
            },
            verification(hours) {
                if (!hours) return;
                this.overtimes(-hours)
            }
        }
    }
</script>

<style>
    .home {
        width: 90%;
        margin: auto;
        text-align: center;
        font-family: "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    }

    .primary-text {
        color: #606266;
        text-align: center;
    }

    .input-num {
        width: 18% !important;
        margin: 0 10px;
    }
</style>