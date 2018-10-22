// pages/index/guide/guide.js
let util = require('../../utils/util.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgs: [
      // "https://kidneyhealty.com.cn/images/guide1.jpg",     
      "../../images/guide1.jpg",
      "",
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    });
    app.wxLogin();
  },

  swiperChange: function (e) {
    if (e.detail.current == this.data.imgs.length - 1) {
      console.log("End swiper and going to redirect to index");
      try {
        var info = app.globalData.userInfo;
        console.log(info);
        if (info != null) {
          console.log("Session contained userInfo.");
          wx.switchTab({
            url: '../index_after_authorize/index_after'
          })
        } else {
          wx.redirectTo({
            url: '../index/index',
          })

        }

      } catch (e) {
        console.log('Exception happen when try to get userBodyInfo from storage!');
        console.log(e);
      }
    }
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
    // wx.switchTab({
    //   url: '../index/index',
    // })
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

})