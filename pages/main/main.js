//index.js
//获取应用实例
let util = require('../../utils/util.js');
let sdk = require('../../vendor/wafer2-client-sdk/index');

const app = getApp()

Page({
  data: {
    empty_wish: "还没你的愿望清单哦 6_6",
    myCompletedWishCount: 0,
    myFriendsCompletedWishCount: 0,
    hasWishList: false,
    userInfo: {},
  },

  onLoad: function () {
    this.setData({
      userInfo: app.globalData.userInfo
    });
    this.setWishListData();
  },
  help: function(e){
    wx.navigateTo({
      url: '../instruction/instruction',
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
    // if (app.globalData.authInfo.openid == null) {
    //   console.log("openID is null - try to login wx again");
    //   app.wxLogin();
    // }
    // this.initWishLists();
    // this.setWishListData();
  },

  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    return {
      title: '友爱清单',
      imageUrl: '../../images/LOGO.png',
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




  touchstart: function (e) {
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      moveIndex: e.currentTarget.dataset.index
    })
  },

  touchmove: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var startX = that.data.startX;
    var touchMoveX = e.changedTouches[0].clientX;
    if ((startX - touchMoveX) > 50) {
      console.info("left move for " + index);
      this.data.wishLists[index].moveForDelete = "touch-move-active";
    }
    if ((touchMoveX - startX) > 50) {
      console.info("right move for " + index);
      this.data.wishLists[index].moveForDelete = "";
    }
    that.setData({
      wishLists: that.data.wishLists
    })
  },

  delWishList: function (e) {
    var index = e.currentTarget.dataset.index;
    var wishListId = this.data.wishLists[index].listId;
    console.info("Going to delete " + wishListId);
    this.deleteWishList(wishListId, app.globalData.authInfo.openid);
    this.initWishLists();
  },

  deleteWishList: function (wishListID,openID) {
    try {
      sdk.request({
        url: app.globalData.apiBase + `/v1/wishes/lists`,
        method: 'DELETE',
        header: { "Content-Type": "application/json" },
        data: {
          "listId": wishListID,
          "listOpenId": openID
        },
        success(result) {
          console.log("请求成功");
          console.log(result);
          if (result.data.error) {
            console.log(result.data.error);
          }
        },
        fail(error) {
          util.showModel('请求失败,请检查网络', error);
          console.log('request fail', error);
        }
      });
    } catch (e) {
      this.setData({
        hiddenLoading: true,
      });
      console.log('Exception happen when delete wish !');
      console.log(e);
    }
  }
})


