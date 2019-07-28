const baseUrl = 'https://xsxt.haoyouqian.net/gcsa/';

function getHeader() {
    let header = {
        'content-type': 'application/octet-stream'
    };
    return header;
}


function postApi(url, data) {
    wx.showLoading({
        title: '加载中'
    });
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}${url}`,
            header: getHeader(),
            method: 'POST',
            data: data,
            success: function (res) {
                wx.hideLoading();
                if (res.statusCode === 200) {
                    resolve(res);
                } else {
                    reject(res.data)
                }
            },
            fail: function (err) {
                wx.hideLoading();
                reject(err);
            }
        });
    }).catch(function (err) {
        wx.showToast({
            title: '未知错误',
            icon: 'none',
            duration: 2000
        });
    });
}


export default postApi