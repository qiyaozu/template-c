const baseUrl = 'https://xsxt.gcsa2019.com/gcsa/';

function getHeader() {
    let header = {
        'content-type': 'application/json'
        // 'content-type': 'application/x-www-form-urlencoded'
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
            success: function(res) {
                wx.hideLoading();
                if (res.statusCode === 200) {
                    resolve(res.data);
                } else {
                    reject(res.data)
                }
            },
            fail: function(err) {
                wx.hideLoading();
                reject(err);
            }
        });
    })
}


export default postApi