// pages/wishList/wishList.js
let util = require("../../utils/util.js");
const app = getApp();
let sdk = require("../../vendor/wafer2-client-sdk/index");

const currentYear = new Date().getFullYear();
const currentMonth = util.formatNumber(new Date().getMonth() + 1);
const currentDate = util.formatNumber(new Date().getDate());
// 封面图列表
const pics = util.posterImages;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    wishes: [],
    wishimage:'',
    listDescription: "",
    listDescription2: "",
    listDueTime: "",
    // headerText: "契约列表",
    datePickerIsShow: false,
    datePickerValue: [currentYear, currentMonth, currentDate],
    year: currentYear,
    month: currentMonth,
    currentDate: currentDate,
    wishListId: null,
    nickName: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    if (options.wishListId == null) {
      console.log("wishListId is null");
    } else {
      this.setData({
        wishimage: pics[options.wishimageId||0],
        wishListId: options.wishListId,
        nickName: options.nickName
      });
      this.refreshWishList();
    }
  },

  takeupWish: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.wishes[index];
    console.log(item);
    console.log("wish id to be take up " + item.wishID + " form id " + e.detail.formId);
    this.takenWish(item.wishID, app.globalData.authInfo.openid, e.detail.formId);
  },

  takenWish: function(wishID, openID, formID) {
    var page = this;
    wx.showLoading({
      title: "加载中..."
    });
    try {
      sdk.request({
        url:
          app.globalData.apiBase +
          `/v1/wishes/taken?` +
          "id=" +
          wishID +
          "&openId=" +
          openID +
          "&formId=" +
          formID,
        method: "PUT",
        header: { "Content-Type": "application/json" },
        success(res) {
          console.log("handling take up wish response");
          console.log(res.data);
          page.setData({
            wishes: res.data
          });
          wx.hideLoading();
        },
        fail(error) {
          util.showModel("请求失败,请检查网络", error);
          console.log("request fail", error);
          wx.hideLoading();
        }
      });
    } catch (e) {
      wx.hideLoading();
      console.log("Exception happen when update wish content!");
      console.log(e);
    }
  },

  refreshWishList: function() {
    wx.showLoading({
      title: "加载中..."
    });
    Promise.all([
      util
        .request(
          app.globalData.apiBase +
            "/v1/wishes?" +
            "wishListId=" +
            this.data.wishListId
        )
        .then(
          res => {
            console.log("refeshing wish data");
            console.log(res.data);
            this.setData({
              wishes: res.data.wishes,
              listDescription: res.data.listDescription,
              listDescription2: res.data.listDescription2,
              listDueTime: res.data.listDueTime,
              year: res.data.listDueTime.substring(0, 4),
              month: res.data.listDueTime.substring(5, 7),
              currentDate: res.data.listDueTime.substring(8, 10)
            });
          },
          res => {
            util.showModel("获取您的契约", res.errMsg);
          }
        )
    ]).then(() => {
      wx.hideLoading();
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.refreshWishList();
  },

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

  createMe: function() {
    console.log('go go go')
    wx.navigateTo({ url: "../index_new/index_new" });
  }
});
