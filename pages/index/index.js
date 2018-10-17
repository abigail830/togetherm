//index.js
//获取应用实例
let util = require('../../utils/util.js');
const app = getApp()

Page({
  data: {

    myCompletedWishCount: 0,
    myFriendsCompletedWishCount:0,
    hasWishList: false,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad: function () {
    this.initWishLists();
    if (app.globalData.userInfo) {   
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  initWishLists: function () {
    console.log("initWishLists is being called");
    if (app.globalData.authInfo.openid == null) {
      console.log("openID is not come back yet");
      app.globalData.myCompletedWishCount = null;
      app.globalData.myFriendsCompletedWishCount = null;
    }
    else {
      return Promise.all([
        util.request(app.globalData.apiBase + "/wish/lists?" + "openId=" + app.globalData.authInfo.openid)
          .then((res) => {
            console.log(res.data);
            app.globalData.myCompletedWishCount = res.data.myCompletedWishCount;
            app.globalData.myFriendsCompletedWishCount = res.data.myFriendsCompletedWishCount;
            app.globalData.wishLists = res.data.wishLists;
            app.globalData.hasWishList = res.data.hasWishList;
            console.log(app.globalData);
            this.setData({
              myCompletedWishCount: app.globalData.myCompletedWishCount,
              myFriendsCompletedWishCount: app.globalData.myFriendsCompletedWishCount,
              hasWishList: app.globalData.hasWishList,
              wishLists: app.globalData.wishLists
            })
          }, (res) => {
            util.showModel('获取您的愿望清单', res.errMsg)
          })
      ]).then(() => {
        wx.hideLoading();
      });
    }
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
  
  }
})

 
