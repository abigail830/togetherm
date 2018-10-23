//index.js
//获取应用实例
let util = require('../../utils/util.js');
const app = getApp()

Page({
  data: {
    hasWishList: false,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad: function () {
  
  },

  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
    wx.switchTab({
      url: '../index_after_authorize/index_after'
    })
  },
 
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    
  },

  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    return {
      title: '友爱清单',
      imageUrl: '../../images/guide1.jpg',
      success: function (res) {
        // 转发成功s
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  },


})

 
