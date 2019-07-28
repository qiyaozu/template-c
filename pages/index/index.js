//index.js
//获取应用实例
import regeneratorRuntime from '../../utils/index.js';
const app = getApp()
import postApi from '../../utils/api.js'
let timer, search_delay = 900

Page({
    data: {
        isPaying: false,
        areaDisable: false,
        isHide: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        showClearAreaBtn: false,
        showAreaList: false,
        // TODO 这里要换成动态获取
        areaList: [],
        currentClass: 1, // 1-5
        group: 2, // 1 幼儿 2 少儿 3 少年
        currentMatch: 1, // 1 初赛 2 复赛
        genders: [{
                name: 1,
                value: '男生',
                checked: 'true'
            },
            {
                name: 2,
                value: '女生'
            },
        ],
        date: '2010-01-01',
        endDate: '',
        gender: 1,
        name: '',
        jianhu: '',
        area: '',
        organization: '', // 机构
        phone: '',
        hasChooseArea: false, // 是否有选择过可选区域
        choosedArea: '',
        userInfo: app.globalData.userInfo,
        isOpenUserinfo: false
    },

    goLogin() {
        wx.navigateTo({
            url: '../login/login',
        })
    },

    async startSignUp() {
        let res = await postApi('admin/autoLoginCheck', {
            weixin: app.globalData.openId
        })
        if (res.resultCode === '0000') {
            app.globalData.phone = res.telephone
            app.globalData.userRole = res.adminUserRole
            if (res.autoLoginFlag === '1') {
                if (res.adminUserRole === '1') { // 区域负责人
                    app.globalData.userRole = '1'
                    wx.navigateTo({
                        url: '../manageIndex/manageIndex'
                    })
                } else {
                    app.globalData.userRole = '2'
                    wx.navigateTo({
                        url: '../sponsor/sponsor'
                    })
                }
            } else {
                wx.navigateTo({
                    url: '../login/login'
                })
            }
        } else {
            wx.navigateTo({
                url: '../login/login'
            })
        }
    },
    // 管理入口
    navigate() {
        // 查看是否有自动登录
        if (!app.globalData.userInfo) {
            wx.showLoading({
                title: '加载中...'
            })
            let timeCount = 0
            let timer = setInterval(() => {
                timeCount++
                if (timeCount >= 25) {
                    wx.hideLoading()
                    this.my_toast('亲，请检查您的网络状态！')
                    clearInterval(timer)
                    return
                }
                if (app.globalData.userInfo) {
                    this.startSignUp()
                    clearInterval(timer)
                }
            }, 200)
        } else {
            this.startSignUp()
        }
    },

    chooseArea(e) {
        this.setData({
            choosedArea: e.currentTarget.dataset.area,
            area: e.currentTarget.dataset.area.areaName,
            showAreaList: false
        })
    },

    organizationInput(e) {
        this.setData({
            organization: e.detail.value
        })
    },

    phoneInput(e) {
        this.setData({
            phone: e.detail.value
        })
    },

    areaInput(e) {
        clearTimeout(timer)

        this.setData({
            area: e.detail.value,
            areaList: []
        })
        if (e.detail.value) {
            this.setData({
                showClearAreaBtn: true,
            })
            timer = setTimeout(() => {
                this.searchArea(e.detail.value)
            }, search_delay)
        }
    },

    clearArea() {
        this.setData({
            area: '',
            showAreaList: false,
            showClearAreaBtn: false
        })
    },

    jianhuInput(e) {
        this.setData({
            jianhu: e.detail.value
        })
    },

    // 输入用户名
    nameInput(e) {
        this.setData({
            name: e.detail.value
        })
    },

    // 更改性别
    genderChange(e) {
        this.setData({
            gender: e.detail.value
        })
    },

    // 选择生日
    bindDateChange(e) {
        this.setData({
            date: e.detail.value
        })
        this.calcAge(this.data.date)
    },

    // 计算年龄
    calcAge(date) {
        let birthArr = date.split('-')
        let bir_year = birthArr[0]
        let bir_month = birthArr[1] * 1
        let bir_day = birthArr[2] * 1

        let now = new Date()
        let now_year = now.getFullYear()
        let now_month = now.getMonth() + 1
        let now_day = now.getDate()
        let year_gap = now_year - bir_year
        if (bir_month < now_month) {
            year_gap += 1
        } else if (bir_month === now_month) {
            if (bir_day < now_day) {
                year_gap += 1
            } else {
                year_gap -= 1
            }
        } else {
            year_gap -= 1
        }
        if (year_gap < 5 || year_gap > 16) {
            this.my_toast('年龄不符合报名条件！')
            this.setData({
                group: 0
            })
        } else if (5 <= year_gap && year_gap <= 8) {
            this.setData({
                group: 1
            })
        } else if (9 <= year_gap && year_gap <= 12) {
            this.setData({
                group: 2
            })
        } else if (13 <= year_gap && year_gap <= 16) {
            this.setData({
                group: 3
            })
        }
    },

    // 选择幼儿、少儿
    getGroup(e) {
        this.setData({
            group: e.detail
        })
    },

    // 选择模特音乐类
    getClass(e) {
        this.setData({
            currentClass: e.detail
        })
    },

    // 选择初赛还是复赛
    getMatch(e) {
        this.setData({
            currentMatch: e.detail
        })
    },

    initDate() {
        let date = new Date().toLocaleDateString().replace(/\//g, '-')
        this.setData({
            endDate: date
        })
    },

    // 点击报名
    signup() {
        if (!this.checkAll()) return
        this.toSignup()
    },

    // 开始支付
    startPay(res) {
        let that = this
        this.setData({
            isPaying: true
        })
        wx.requestPayment({
            timeStamp: res.timeStamp,
            nonceStr: res.nonceStr,
            package: res.prepayPackage,
            signType: 'MD5',
            paySign: res.paySign,
            success(response) {
                that.changeOrderStatus(res.orderId)
                that.setData({
                    isPaying: false
                })
            },
            fail(response) {
                that.my_toast('支付失败')
                that.changeOrderStatus(res.orderId, response)
                that.setData({
                    isPaying: false
                })
            }
        })
    },

    // 更新订单状态
    async changeOrderStatus(orderId, errorRes) {
        let formData = {
            weixin: app.globalData.openId,
            orderId: orderId,
            completePayTime: Date.now(),
            payStatus: errorRes ? 'FAIL' : 'SUCCESS',
            returnMessage: errorRes ? errorRes : ''
        }
        let res = await postApi('pay/payComplete', formData)
        if (res.resultCode === '0000') {
            if (errorRes) {
                this.my_toast('支付失败')
            } else {
                setTimeout(() => {
                    wx.navigateTo({
                        url: '../signUpSuccess/signUpSuccess?orderId=' + orderId,
                    })
                }, 2000)
            }
        }
    },

    // 开始报名
    async toSignup() {
        if (this.data.isPaying) return false
        let formData = {
            weixin: app.globalData.openId,
            registeryLevel: this.data.currentMatch,
            participantName: this.data.name,
            gender: this.data.gender,
            groupType: this.data.group,
            projectName: this.data.currentClass,
            birthday: this.data.date,
            guardian: this.data.jianhu,
            guardianContact: this.data.phone,
            organization: this.data.organization,
            areaCode: this.data.choosedArea.areaCode,
            areaName: this.data.choosedArea.areaName,
            openId: app.globalData.openId
        }
        this.setData({
            isPaying: true
        })
        let res = await postApi('user/signup', formData)
        if (res.resultCode === '0000') {
            this.startPay(res)
        } else {
            this.my_toast(res.resultMsg)
            this.setData({
                isPaying: false
            })
        }
    },

    my_toast(text) {
        wx.showToast({
            title: text,
            icon: 'none',
            duration: 2000
        })
    },

    my_setStorage(key, value) {
        wx.setStorage({ //存储到本地
            key: key,
            data: value
        })
    },

    checkAll() {
        if (!this.data.name) {
            this.my_toast('请输入选手姓名')
            return false
        } else if (!this.data.group) {
            this.my_toast('请选择出生日期')
            return false
        } else if (!this.data.choosedArea) {
            this.my_toast('请选择参赛区域')
            return false
        } else if (!this.data.jianhu) {
            this.my_toast('请输入监护人姓名')
            return false
        } else if (!this.data.phone) {
            this.my_toast('请输入监护人手机号码')
            return false
        }
        return true
    },

    // 查询用户用户输入的县/区
    async searchArea(text) {
        let res = await postApi('signup/areaQuery', {
            areaKeyword: text
        })
        if (res.resultCode === '0000') {
            this.setData({
                showAreaList: true,
                areaList: res.areaList
            })
        } else {
            this.my_toast('暂未找到该区域的')
        }
    },

    bindGetUserInfo(e) {
        if (e.detail.userInfo) {
            this.setData({
                isHide: false,
                userInfo: e.detail.userInfo
            });
            app.globalData.userInfo = e.detail.userInfo
        } else {
            //用户按了拒绝按钮
            wx.showModal({
                title: '警告',
                content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
                showCancel: false,
                confirmText: '返回授权',
                success: function(res) {
                    // 用户没有授权成功，不需要改变 isHide 的值
                    if (res.confirm) {
                        console.log('用户点击了“返回授权”');
                    }
                }
            });
        }
    },

    getOpenid(cb) {
        wx.login({
            success(res) {
                if (res.code) {
                   
                }
            }
        })
    },

    async getAreaByCode (code) {
        let res = await postApi('area/queryArea', {areaCode: code})
        if (res.resultCode === '0000') {
            this.setData({
                choosedArea: res.areaList[0],
                area: res.areaList[0].areaName
            })
        }
    },

    onLoad: function(query) {
        // 通过二维码传过来的参数
        console.log(query)
        if (query.scene) {
            const areaCode = decodeURIComponent(query.scene)
            console.log('this is query data by qrcode:')
            console.log(areaCode)
            this.my_toast(areaCode)
            this.setData({
                areaDisable: true
            })
            this.getAreaByCode(areaCode)
        }

        this.initDate()
        var that = this;
        // 查看是否授权
        wx.getSetting({
            success: function(res) {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: function(res) {
                            app.globalData.userInfo = res.userInfo
                            that.setData({
                                userInfo: res.userInfo
                            })
                        }
                    });
                } else {
                    that.setData({
                        isHide: true
                    });
                }
            }
        });
    }
})
