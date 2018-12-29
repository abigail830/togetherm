//index.js
//获取应用实例
const app = getApp();
let util = require("../../utils/util.js");

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse("button.open-type.getUserInfo")
  },

  onLoad: function() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
      this.initWishLists();
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
        this.initWishLists();
      };
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
          this.initWishLists();
        }
      });
    }
  },
  getUserInfo: function(e) {
    console.log(e);
    app.globalData.userInfo = e.detail.userInfo;
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
    this.initWishLists();
  },
  initWishLists: function() {
    wx.showLoading({
      title: "加载中..."
    });
    console.log("initWishLists is being called in index_new.js");
    if (app.globalData.authInfo.openid == null) {
      console.log("openID is not come back yet in index_new.js");
      app.globalData.myCompletedWishCount = null;
      app.globalData.myFriendsCompletedWishCount = null;
    } else {
      return Promise.all([
        util
          .request(
            app.globalData.apiBase +
              "/v1/wishes/lists/timeline?" +
              "openId=" +
              app.globalData.authInfo.openid
          )
          .then(
            res => {
              console.log(res.data);
              app.globalData.myCompletedWishCount =
                res.data.myCompletedWishCount;
              app.globalData.myFriendsCompletedWishCount =
                res.data.myFriendsCompletedWishCount;
              app.globalData.wishLists = res.data.wishLists;
              app.globalData.hasWishList = res.data.hasWishList;
              app.globalData.timeline = res.data.wishListTimelineEntryList;
              console.log(app.globalData);
              // this.setWishListData();
              // wx.hideLoading();
            },
            res => {
              util.showModel("获取您的契约契约", res.errMsg);
            }
          )
      ]).then(() => {
        wx.hideLoading();
        wx.redirectTo({ url: "../main_new/main" });
        // wx.switchTab({
        //   url: "../main/main"
        // });
      });
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: "友爱契约",
      imageUrl: "../../images/LOGO.png",
      success: function(res) {
        // 转发成功s
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function(res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    };
  }
});
