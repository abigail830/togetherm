//index.js
//获取应用实例
let util = require('../../utils/util.js');
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    wishListId: null,
    nickName: null
  },

  onLoad: function (options) {
    console.log(options);

    if (options.wishListId == null) {
      console.log("wishListId is null");
    } else {
      console.log(options.wishListId);
      console.log(options.nickName);
      this.setData({
        wishListId: options.wishListId,
        nickName: options.nickName
      })
    }
    app.wxLogin();
    wx.navigateTo({
      url: '../shareWish/shareWish?wishListId=' + this.data.wishListId + '&nickName=' + this.data.nickName,
    })
  },

  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
    wx.navigateTo({
      url: '../shareWish/shareWish?wishListId=' + this.data.wishListId + '&nickName=' + this.data.nickName,
    })
  },

  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {

  },

})


