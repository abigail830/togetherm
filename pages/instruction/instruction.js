// pages/instruction/instruction.js

const app = getApp();
let util = require("../../utils/util.js");
let i = 1;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    entranceState: false,
    entrances: [
      {
        id: "",
        name: "默认"
      },
      {
        id: "dt",
        name: "兔叮贺年专用"
      },
      {
        id: "ts",
        name: "天硕光大活动"
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return util.shareDate();
  },

  toMain: function(e) {
    console.info("to main called");
    wx.navigateBack();
    // wx.navigateTo({ url: "../main_new/main" });
    // wx.switchTab({
    //   url: '../main/main',
    // });
  },
  selectEntrance(e) {
    app.globalData.entrance = e.currentTarget.dataset.id;
    this.toMain();
    // wx.redirectTo({ url: "../main_new/main" });
  },
  showEntrance() {
    if (i === 10) {
      this.setData({ entranceState: true });
    } else if (i > 10) {
      i = 2;
      this.setData({ entranceState: false });
      return;
    }
    i++;
  },
  bindPickerChange(e) {
    // this.setData({
    //   index: e.detail.value
    // })
  }
});
