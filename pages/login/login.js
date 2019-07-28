// pages/login/login.js
import regeneratorRuntime from '../../utils/index.js';
const app = getApp()
import postApi from '../../utils/api.js'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        remember: true,
        phone: '',
        code: '',
        codeText: '获取验证码',
    },

    // 获取验证码
    async getCode () {
        if(!this.checkPhone() || this.data.codeText !== '获取验证码') return
        let formData = {
            telephone: this.data.phone
        }

        let that = this
        wx.showLoading({
            title: '加载中'
        });
        let res = await postApi('signup/getMsgCode', formData)
        wx.hideLoading();
        if (res.resultCode === '0000') {
            that.my_toast('发送成功')
            let time = 60

            let timer = setInterval(() => {
                that.setData({
                    codeText: time-- + 's'
                })
                console.log(time);
                if (time === 0) {
                    clearInterval(timer)
                    that.setData({
                        codeText: '获取验证码'
                    })
                }
            }, 1000)
        } else {
            console.log('get code fail')
            that.my_toast(res.data.resultMsg)
        }
    },

    codeInput (e) {
        this.setData({
            code: e.detail.value
        })
    },

    // 是否自动登录
    chooseRemember () {
        this.setData({
            remember: !this.data.remember
        })
        this.my_setStorage("isRemember", this.data.remember)
    },

    my_setStorage (key, value) {
        wx.setStorage({//存储到本地
            key: key,
            data: value
        })
    },

    async login () {
        if (!this.checkPhone()) return false;
        if (!this.data.code) {
            this.my_toast('请输入验证码')
            return false
        }
        let formData = {
            telephone: this.data.phone,
            weixin: app.globalData.openId,
            msgCode: this.data.code,
            autoLoginFlag: this.data.remember ? '1' : '0'
        }
        let res = await postApi('admin/login', formData)
        console.log('login_res: ', res);
        if (res.resultCode === '0000') {
            app.globalData.phone = this.data.phone
            app.globalData.userRole = res.userRole
            // 1 区域负责人 2 主办方
            if(res.userRole === '1') {
              wx.navigateTo({
                  url: '../manageIndex/manageIndex'
              })
            } else if(res.userRole === '2') {
              wx.navigateTo({
                  url: '../sponsor/sponsor'
              })
            } else {
              this.my_toast('不是管理员账号')
            }

        } else {
            this.my_toast(res.resultMsg)
        }
    },

    phoneInput (e) {
        this.setData({
            phone: e.detail.value
        })
    },

    checkPhone () {
        if (!this.data.phone) {
            this.my_toast('请输入手机号')
            return
        }
        let reg = /^[1][3,4,5,7,8,9][0-9]{9}$/
        if (!reg.test(this.data.phone)) {
            this.my_toast('手机格式有误')
            return false
        }
        return true
    },

    my_toast(text) {
        wx.showToast({
            title: text,
            icon: 'none',
            duration: 2000
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
