//index.js
//获取应用实例
let util = require('../../utils/util.js');
const app = getApp()

Page({
  data: {
    empty_wish: "还没找到你的愿望清单哦 6_6",
    myCompletedWishCount: 0,
    myFriendsCompletedWishCount: 0,
    hasWishList: false,
    userInfo: {},
  },

  onLoad: function () {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },
  addWishList: function (e) {
    wx.navigateTo({
      url: '../wishList/wishList',
    })
  },

  setWishListData: function () {
    if (app.globalData.myCompletedWishCount != null) {
      this.setData({
        myCompletedWishCount: app.globalData.myCompletedWishCount,
        myFriendsCompletedWishCount: app.globalData.myFriendsCompletedWishCount,
        hasWishList: app.globalData.hasWishList,
        wishLists: app.globalData.wishLists
      })
    }
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    this.initWishLists();
    // this.setWishListData();
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


  initWishLists: function () {
    wx.showLoading({
      title: '加载中...',
    });
    console.log("initWishLists is being called in index_after.js");
    if (app.globalData.authInfo.openid == null) {
      console.log("openID is not come back yet in index_after.js");
      app.globalData.myCompletedWishCount = null;
      app.globalData.myFriendsCompletedWishCount = null;
    } 
    else {
      return Promise.all([
        util.request(app.globalData.apiBase + "/v1/wishes/lists?" + "openId=" + app.globalData.authInfo.openid)
          .then((res) => {
            console.log(res.data);
            app.globalData.myCompletedWishCount = res.data.myCompletedWishCount;
            app.globalData.myFriendsCompletedWishCount = res.data.myFriendsCompletedWishCount;
            app.globalData.wishLists = res.data.wishLists;
            app.globalData.hasWishList = res.data.hasWishList;
            console.log(app.globalData);
            this.setWishListData();
            wx.hideLoading();
          }, (res) => {
            util.showModel('获取您的愿望清单', res.errMsg)
          })
      ]).then(() => {
        wx.hideLoading();
      });
    }
  },
})


