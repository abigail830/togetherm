//index.js
//获取应用实例
let util = require("../../utils/util.js");
let sdk = require("../../vendor/wafer2-client-sdk/index");

const app = getApp();
const format0 = function(num) {
  return num < 10 ? "0" + num : num;
};
Page({
  data: {
    empty_wish: "还没你的契约契约哦 6_6",
    empty_wish2: "你还没GET过朋友的契约契约哦 6_6",
    myCompletedWishCount: 0,
    myFriendsCompletedWishCount: 0,
    hasWishList: false,
    userInfo: {},
    hasUserInfo: false,
    timeline: [],
    friendTimeline: [],
    outstandingCoupon: null,
    iconDone: "",
    showType: "friend" //me ,friend
  },

  onLoad: function() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
    }
    wx._pageMain = this;
    wx._app = app;
    wx._util = util;
    // this.setWishListData();
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
        timeline: app.globalData.timeline,
        outstandingCoupon: app.globalData.outstandingCoupon
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
    return util.shareDate(null, null);
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

  selectFriend: function() {
    wx.showLoading({
      title: "加载中..."
    });
    console.log("selectFriend");
    this.setData({ showType: "friend" });
    Promise.all([
      util
        .request(
          app.globalData.apiBase +
            "/v1/wishes/taken/timeline?" +
            "openId=" +
            app.globalData.authInfo.openid
        )
        .then(
          res => {
            console.log(res.data);
            let friendTimeline = res.data.takenWishTimelineEntryList.map(e => {
              e.takenWishDTOList = e.takenWishDTOList.map(e => {
                let date = new Date(e.listDueTime.replace(/ /g, "T"));
                e.dateInTime =
                  format0(date.getHours()) + ":" + format0(date.getMinutes());
                e.iconDone = util.getIconDone(null, e.createTime);
                return e;
              });
              return e;
            });
            this.setData({
              iconDone: app.globalData.iconDone,
              friendTimeline: friendTimeline
            });
            console.log(this.data.friendTimeline);

            wx.hideLoading();
          },
          res => {
            util.showModel("获取您的认领契约", res.errMsg);
          }
        )
    ]).then(() => {
      wx.hideLoading();
    });
  },

  acknowledgeCard: function() {
    try {
      console.log("Acknowledge card");
      sdk.request({
        url:
          app.globalData.apiBase +
          `/coupon/?openID=` +
          app.globalData.authInfo.openid,
        method: "PUT",
        header: { "Content-Type": "application/json" },
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
      console.log("Exception happen when acknowledge card !");
      console.log(e);
    }
  },

  addCard: function(e) {
    let coupon = this.data.outstandingCoupon;
    var cardID = coupon === null && typeof e === "string" ? e : coupon.coupon;
    var page = this;
    wx.request({
      url: app.globalData.apiBase + "/wx/platform/cardsign?cardID=" + cardID,
      data: {},
      method: "GET",
      success: function(res) {
        console.log(res);
        wx.addCard({
          cardList: [
            {
              cardId: cardID,
              cardExt:
                '{"code":"","openid":"","timestamp":' +
                res.data.timestamp +
                ',"nonce_str":"' +
                res.data.nonceStr +
                '","signature":"' +
                res.data.signature +
                '"}'
            }
          ],
          success: function(result) {
            console.log(res);
            wx.showToast({
              title: "领取成功",
              icon: "success",
              duration: 2000
            });
            app.globalData.outstandingCoupon = null;
            page.setData({ outstandingCoupon: null });
            if (app.globalData.postCoupon) {
              page.acknowledgeCard();
            } else {
            }
          },
          fail: function(res) {
            console.log("领取失败");
            if (res && res.errMsg === "addCard:fail cancel") {
              app.globalData.repeatTipCard &&
                page.getCardTip("请先点击领取卡券^-^");
              console.log("再次弹出领取???");
            }
            console.log(res);
          }
        });
      }
    });
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
          let timeline = res.data.wishListTimelineEntryList.map(e => {
            e.wishListDTOList = e.wishListDTOList.map(e => {
              let date = new Date(e.listDueTime.replace(/ /g, "T"));
              e.activeColor = e.progress !== 100 ? "#ffd45a" : "#E60C12";
              e.dateInTime =
                format0(date.getHours()) + ":" + format0(date.getMinutes());
              return e;
            });
            return e;
          });
          app.globalData.myCompletedWishCount = res.data.myCompletedWishCount;
          app.globalData.myFriendsCompletedWishCount =
            res.data.myFriendsCompletedWishCount;
          app.globalData.wishLists = res.data.wishLists;
          app.globalData.hasWishList = res.data.hasWishList;
          app.globalData.timeline = timeline;
          app.globalData.outstandingCoupon = res.data.outstandingCoupon;
          // todo dev
          // app.globalData.outstandingCoupon = { coupon: 1 };
          // 有卡券待领
          // if (app.globalData.outstandingCoupon) {
          //   this.getCardTip();
          // }
          //new Date('2018-12-24 13:19:29'.replace(/ /g,"T"))
          this.setWishListData();
          wx.hideLoading();
        },
        res => {
          util.showModel("获取您的契约契约", res.errMsg);
        }
      );
  },
  getCardTip(tip = "您有卡券待领!") {
    let that = this;
    // wx.showModal({
    //   title: "温馨提示",
    //   showCancel: false,
    //   content: tip,
    //   confirmText: "领取",
    //   success(res) {
    //     if (res.confirm) {
    //       that.addCard();
    //     }
    //   }
    // });
  }
});
