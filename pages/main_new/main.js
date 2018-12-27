//index.js
//获取应用实例
let util = require("../../utils/util.js");
let sdk = require("../../vendor/wafer2-client-sdk/index");

const app = getApp();

Page({
  data: {
    empty_wish: "还没你的愿望清单哦 6_6",
    empty_wish2: "你还没GET过朋友的愿望清单哦 6_6",
    myCompletedWishCount: 0,
    myFriendsCompletedWishCount: 0,
    hasWishList: false,
    userInfo: {},
    hasUserInfo: false,
    timeline: [],
    friendTimeline: [],
    showType: "me" //me ,friend
  },

  onLoad: function() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
    }

    this.setWishListData();
  },
  help: function(e) {
    wx.navigateTo({
      url: "../instruction/instruction"
    });
  },

  addWishList: function(e) {
    wx.navigateTo({
      url: "../wishList/wishList"
    });
  },

  setWishListData: function() {
    if (app.globalData.myCompletedWishCount != null) {
      this.setData({
        myCompletedWishCount: app.globalData.myCompletedWishCount,
        myFriendsCompletedWishCount: app.globalData.myFriendsCompletedWishCount,
        hasWishList: app.globalData.hasWishList,
        wishLists: app.globalData.wishLists,
        timeline: app.globalData.timeline
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (this.data.showType === "me") {
      this.selectMe();
    } else {
      this.selectFriend();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: "友爱清单",
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
  },

  touchstart: function(e) {
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      moveIndex: e.currentTarget.dataset.index
    });
  },

  touchmove: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var startX = that.data.startX;
    var touchMoveX = e.changedTouches[0].clientX;
    if (startX - touchMoveX > 50) {
      console.info("left move for " + index);
      this.data.wishLists[index].moveForDelete = "touch-move-active";
    }
    if (touchMoveX - startX > 50) {
      console.info("right move for " + index);
      this.data.wishLists[index].moveForDelete = "";
    }
    that.setData({
      wishLists: that.data.wishLists
    });
  },

  delWishList: function(e) {
    var index = e.currentTarget.dataset.index;
    var wishListId = this.data.wishLists[index].listId;
    console.info("Going to delete " + wishListId);
    this.deleteWishList(wishListId, app.globalData.authInfo.openid);
    this.initWishLists();
  },

  deleteWishList: function(wishListID, openID) {
    try {
      sdk.request({
        url: app.globalData.apiBase + `/v1/wishes/lists`,
        method: "DELETE",
        header: { "Content-Type": "application/json" },
        data: {
          listId: wishListID,
          listOpenId: openID
        },
        success(result) {
          console.log("请求成功");
          console.log(result);
          if (result.data.error) {
            console.log(result.data.error);
          }
        },
        fail(error) {
          util.showModel("请求失败,请检查网络", error);
          console.log("request fail", error);
        }
      });
    } catch (e) {
      this.setData({
        hiddenLoading: true
      });
      console.log("Exception happen when delete wish !");
      console.log(e);
    }
  },

  selectFriend() {
    console.log("selectFriend");

    this.setData({ showType: "friend" });
    util
      .request(
        app.globalData.apiBase +
          "/v1/wishes/taken?" +
          "openId=" +
          app.globalData.authInfo.openid
      )
      .then(
        res => {
          console.log(res.data);
          this.setData({
            friendTimeline: [
              {
                asofMonth: "2028年12月",
                wishListDTOList: [
                  {
                    wishID: 85,
                    wishListID: 24,
                    wishStatus: "DONE",
                    listId: 82,
                    description: "吃大餐",
                    listDescription: "我的愿望是什么",
                    listDueTime: "2028-12-19 00:59:59",
                    dateInMonth: "19",
                    yearAndMonth: "2028-12"
                  },
                  {
                    wishID: 230,
                    wishListID: 24,
                    wishStatus: "TAKEUP",
                    listId: 82,
                    description: "吃大餐222",
                    listDescription: "我的愿望是什么",
                    listDueTime: "2028-12-19 00:59:59",
                    dateInMonth: "19",
                    yearAndMonth: "2028-12"
                  }
                ]
              }
            ]
          });
          wx.hideLoading();
        },
        res => {
          util.showModel("获取您的认领愿望", res.errMsg);
        }
      );
  },
  cancelWish(e) {
    let wishID = e.target.dataset.wishid;
    let page = this;
    let openID = app.globalData.authInfo.openid;
    wx.showLoading({
      title: "加载中..."
    });
    try {
      sdk.request({
        url: app.globalData.apiBase + `/v1/wishes/taken?id=${wishID}`,
        method: "DELETE",
        header: { "Content-Type": "application/json" },
        success(res) {
          wx.hideLoading();
          page.selectFriend();
          console.log(res.data);
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
  doneWish(e) {
    let wishID = e.target.dataset.wishid;
    let page = this;
    let openID = app.globalData.authInfo.openid;
    wx.showLoading({
      title: "加载中..."
    });
    try {
      sdk.request({
        url:
          app.globalData.apiBase +
          `/v1/wishes/completed?` +
          "id=" +
          wishID +
          "&openId=" +
          openID,
        method: "PUT",
        header: { "Content-Type": "application/json" },
        success(res) {
          wx.hideLoading();
          page.selectFriend();
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
  selectMe() {
    console.log("selectMe");
    this.setData({ showType: "me" });
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
          app.globalData.myCompletedWishCount = res.data.myCompletedWishCount;
          app.globalData.myFriendsCompletedWishCount =
            res.data.myFriendsCompletedWishCount;
          app.globalData.wishLists = res.data.wishLists;
          app.globalData.hasWishList = res.data.hasWishList;
          app.globalData.timeline = res.data.wishListTimelineEntryList;
          console.log(app.globalData);
          this.setWishListData();
          wx.hideLoading();
        },
        res => {
          util.showModel("获取您的愿望清单", res.errMsg);
        }
      );
  }
});
