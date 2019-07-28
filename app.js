//app.js
import regeneratorRuntime from './utils/index.js';
import postApi from './utils/api.js'

App({
    onLaunch: function() {
        this.getOpenid()
    },
    getOpenid() {
        let that = this
        wx.login({
            success(res) {
                if (res.code) {
                    postApi('signup/getOpenId', { code: res.code}).then(res_openid => {
                        that.globalData.openId = res_openid.openId
                    })
                }
            }
        })
    },
    globalData: {
        userInfo: null
    }
})