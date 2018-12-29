// pages/otherWish/otherWish.js
let util = require('../../utils/util.js');
const app = getApp();
let sdk = require('../../vendor/wafer2-client-sdk/index');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    empty_wish: "还没找到你认领的朋友契约契约哦 6_6",
    hasWishList: false,
    userInfo: {},
    hasUserInfo: false,
    opneID: null,
    takenUpWishes: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        openID: app.globalData.authInfo.openid
      });
      this.loadTakenWishes(app.globalData.authInfo.openid);
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          openID: app.globalData.authInfo.openid
        });
        this.loadTakenWishes(app.globalData.authInfo.openid);
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
            openID: app.globalData.authInfo.openid
          });
          this.loadTakenWishes(app.globalData.authInfo.openid);
        }
      })
    }
  },

  loadTakenWishes: function (openID) {
    wx.showLoading({
      title: '加载中...',
    });
    Promise.all([
      util.request(app.globalData.apiBase + "/v1/wishes/taken?" + "openId=" + openID)
        .then((res) => {
          console.log(res.data);
          this.setData(
            {
              takenUpWishes: res.data
            }
          );
          wx.hideLoading();
        }, (res) => {
          util.showModel('获取您的认领契约', res.errMsg)
        })
    ]).then(() => {
      wx.hideLoading();
    });
  },


  completeWish: function (wishID) {
    var page = this;
    var openID = app.globalData.authInfo.openid;
    wx.showLoading({
      title: '加载中...',
    });
    try {
      sdk.request({
        url: app.globalData.apiBase + `/v1/wishes/completed?` + "id=" + wishID + "&openId=" + openID,
        method: 'PUT',
        header: { "Content-Type": "application/json" },
        success(res) {
          console.log(res.data);
          page.setData(
            {
              takenUpWishes: res.data
            }
          );
          wx.hideLoading();

        },
        fail(error) {
          util.showModel('请求失败,请检查网络', error);
          console.log('request fail', error);
          wx.hideLoading();

        }
      });
    } catch (e) {
      wx.hideLoading();
      console.log('Exception happen when update wish content!');
      console.log(e);
    }
  },


  doneWish: function (e) {
    var index = e.target.dataset.index;
    var wishID = this.data.takenUpWishes[index].wishID;
    console.log("Mark wish as done for wish ID " + wishID);
    this.completeWish(wishID);
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
    this.loadTakenWishes(app.globalData.authInfo.openid);
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
    return {
      title: '友爱契约',
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
  }
})