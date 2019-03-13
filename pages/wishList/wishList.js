// pages/wishList/wishList.js
let util = require("../../utils/util.js");
const app = getApp();
let sdk = require("../../vendor/wafer2-client-sdk/index"),
  Poster;

// 封面图列表
const pics = util.posterImages;
const currentYear = new Date().getFullYear();
const currentMonth = util.formatNumber(new Date().getMonth() + 1);
const currentDate = util.formatNumber(new Date().getDate() + 5);

Page({
  /**
   * 页面的初始数据
   */
  data: {
    wishes: [],
    implementorsLimit: 1, //人数
    deNickname: "神秘的朋友",
    listDescription: "",
    listDescription2: "",
    listDueTime: "",
    // headerText: "契约列表",
    datePickerIsShow: false,
    datePickerValue: [currentYear, currentMonth, currentDate],
    year: currentYear,
    month: currentMonth,
    currentDate: currentDate,
    wishListID: null,
    canDelete: true,
    entrance:"",
    wishimage: "",
    nickname:"",
    touchMoveIndex: null,
    isPickerRender: false,
    isPickerShow: false,
    timePickerConfig: {
      confirmColor: "#F08080",
      column: "hour"
    },
    selectPicIndex: 0,
    pics: [],
    timeout: false,
    formId: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    Poster = this.selectComponent("#wish-poster");
    if (options.wishListID == null) {
      console.log("Going to create new wishlist ");
      this.postWishList();
      this.setData({
        pics: pics(),
        wishimage: pics(0)
      });
    } else {
      this.setData({
        nickname: app.globalData.userInfo.nickName,
        entrance: app.globalData.entrance,
        wishListID: options.wishListID,
        pics: pics(),
        wishimage: pics(0)
      });
      console.log(this.data.wishListID);

      return Promise.all([
        util
        .request(
          app.globalData.apiBase +
          "/v1/wishes?" +
          "wishListId=" +
          options.wishListID
        )
        .then(
          res => {
            console.log(res.data);
            let canDelete = true;
            let arr = res.data.wishes;
            let len = arr.length;
            for (let i = 0; i < len; i += 1) {
              if (arr[i].wishStatus !== "NEW") {
                canDelete = false;
                break;
              }
            }
            this.setData({
                canDelete: canDelete,
                wishes: res.data.wishes,
                listDescription: res.data.listDescription,
                listDescription2: res.data.listDescription2,
                listDueTime: res.data.listDueTime,
                year: res.data.listDueTime.substring(0, 4),
                month: res.data.listDueTime.substring(5, 7),
                currentDate: res.data.listDueTime.substring(8, 10),
                timeout: new Date(
                  res.data.listDueTime.replace(new RegExp(/-/gm), "/")
                ) < new Date(),
                timePickerConfig: {
                  defaultDate: res.data.listDueTime.length < 11 ?
                    res.data.listDueTime + " 00:59:59" :
                    res.data.listDueTime,
                  ...this.data.timePickerConfig
                }
              },
              () => {
                Poster.updatePosterConfig();
              }
            );
          },
          res => {
            util.showModel("获取您的契约", res.errMsg);
          }
        )
      ]).then(() => {
        wx.hideLoading();
      });
    }
  },

  loadWish: function() {
    util
      .request(
        app.globalData.apiBase +
        "/v1/wishes?" +
        "wishListId=" +
        this.data.wishListID
      )
      .then(res => {
        console.log(res.data);
        this.setData({
            wishes: res.data.wishes
          },
          () => {
            Poster.updatePosterConfig();
          }
        );
      });
  },
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
  onShareAppMessage: function(options) {
    let imageUrl = pics(this.data.selectPicIndex);
    if (options.from == "button") {
      console.log(this.data.wishListID);
      var nick_name = app.globalData.userInfo ?
        app.globalData.userInfo.nickName :
        this.data.deNickname;
      // const path = "/pages/shareIndex/shareIndex?wishListId=" + this.data.wishListID + "&wishimageId=" + this.data.selectPicIndex + "&nickName=" +  nick_name;

      const path =
        "/pages/shareWish/shareWish?wishListId=" +
        this.data.wishListID +
        "&wishimageId=" +
        this.data.selectPicIndex +
        "&wishimageUrl=" +
        imageUrl +
        "&nickName=" +
        nick_name;
      return util.shareDate(
        nick_name + " " + this.data.listDescription,
        imageUrl,
        path
      );
    } else {
      return util.shareDate(null, null);
    }
  },
  bindKeyInput: function(e) {
    this.setData({
      listDescription: e.detail.value
    });
  },
  bindTitleInput: function (e) {
    this.setData({
      listDescription2: e.detail.value
    });
  }, 
  bindImplementorsLimitInput: function (e) {
    this.setData({
      implementorsLimit: e.detail.value
    });
  },
  bindWishKeyInput: function(e) {
    var id = e.currentTarget.dataset.id;
    var value = e.detail.value;
    var item = this.data.wishes[id];
    item.description = value;
    this.setData({
      wishes: this.data.wishes
    });
  },

  reload: function() {
    wx.showLoading({
      title: "加载中..."
    });
    console.log("reload timeline data");
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
          app.globalData.myCompletedWishCount = res.data.myCompletedWishCount;
          app.globalData.myFriendsCompletedWishCount =
            res.data.myFriendsCompletedWishCount;
          app.globalData.wishLists = res.data.wishLists;
          app.globalData.hasWishList = res.data.hasWishList;
          app.globalData.timeline = res.data.wishListTimelineEntryList;
          console.log(app.globalData);
          Poster.updatePosterConfig();
        },
        res => {
          util.showModel("获取您的契约契约", res.errMsg);
        }
      )
    ]).then(() => {
      wx.hideLoading();
    });
  },

  postWishList: function() {
    console.log("add wish list ");
    var myPage = this;
    try {
      sdk.request({
        url: app.globalData.apiBase + `/v1/wishes/lists`,
        method: "POST",
        header: {
          "Content-Type": "application/json"
        },
        data: {
          listDescription2: "我的新契约",
          listDescription: "我的新契约",
          listDueTime: currentYear + "-" + currentMonth + "-" + currentDate,
          listOpenId: app.globalData.authInfo.openid,
          implementorsLimit: this.data.implementorsLimit
        },
        success(result) {
          console.log("请求成功");
          console.log(result);
          myPage.setData({
            wishListID: result.data.listId,
            listDescription2: result.data.listDescription2,
            listDescription: result.data.listDescription,
            listDueTime: result.data.listDueTime,
            implementorsLimit: result.data.implementorsLimit
          });
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
      console.log("Exception happen when update wish content!");
      console.log(e);
    }
    this.reload();
  },

  addWish: function(itemID) {
    var item = this.data.wishes[itemID];
    Poster.updatePosterConfig();
    console.log("add wish id to be change " + item.wishID);
    console.log("add new wish to wishList id " + this.data.wishListID);
    try {
      console.log("添加新的契约项");
      let formId = "";
      if (this.data.formId) {
        formId = "formId=" + this.data.formId;
      }
      const url = app.globalData.apiBase + `/v1/wishes?${formId}`;
      console.warn(url);
      this.setData({
        formId: null
      })

      sdk.request({
        url: url,
        method: "POST",
        header: {
          "Content-Type": "application/json"
        },
        data: {
          description: item.description,
          wishListID: this.data.wishListID,
          wishStatus: "NEW"
        },
        success(result) {
          console.log("请求成功");
          console.log(result);
          item.wishID = result.data.wishID;
          item.wishListID = result.data.wishListID;
          item.wishStatus = result.data.wishStatus;
          item.createTime = result.data.createTime;
          item.lastUpdateTime = result.data.lastUpdateTime;
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
      console.log("Exception happen when update wish content!");
      console.log(e);
    }
    this.reload();
  },

  updateWish: function(itemID) {
    var item = this.data.wishes[itemID];
    console.log("update wish id to be change " + item.wishID);
    console.log("update wish desc changed to " + item.description);
    console.log("update wishList id " + this.data.wishListID);
    Poster.updatePosterConfig();
    console.warn(this.data.wishes);
    try {
      sdk.request({
        url: app.globalData.apiBase + `/v1/wishes`,
        method: "PUT",
        header: {
          "Content-Type": "application/json"
        },
        data: {
          wishID: item.wishID,
          description: item.description,
          wishListID: this.data.wishListID,
          wishStatus: item.wishStatus
        },
        success(result) {
          console.log("请求成功");
          console.log(result);
          // if (result.data.error) {
          //   console.log(result.data.error);
          // } else {

          //   wx.redirectTo({
          //     url: "../main/main"
          //   });
          // }
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
      console.log("Exception happen when update wish content!");
      console.log(e);
    }
  },

  deleteWish: function(wishID, back) {
    console.log("Going to delete wish id: " + wishID);
    try {
      sdk.request({
        url: app.globalData.apiBase + `/v1/wishes`,
        method: "DELETE",
        header: {
          "Content-Type": "application/json"
        },
        data: {
          wishID: wishID,
          wishListID: this.data.wishListID,
        },
        success(result) {
          if (back) wx.navigateBack();
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
    this.reload();
  },

  bindDescCompleted: function(e) {
    var id = e.currentTarget.dataset.id;
    var item = this.data.wishes[id];
    if (item) {
      console.log("wish id to be change " + item.wishID);
      console.log("wish desc changed to " + item.description);
      console.log("wishList id " + this.data.wishListID);
      if (item.description && item.description.length > 0) {
        if (item.wishID > 0) {
          this.updateWish(id);
        } else {
          this.addWish(id);
        }
      } else {
        console.info("Wish desciption is empty, ignore...");
      }
    }
  },

  bindListDescCompleted: function(e) {
    console.log(
      "detect description change, udpate description " +
      this.data.listDescription +
      " for " +
      this.data.wishListID
    );
    this.updateWishList();
  },

  updateWishList: function() {
    Poster.updatePosterConfig();
    try {
      sdk.request({
        url: app.globalData.apiBase + `/v1/wishes/lists`,
        method: "PUT",
        header: {
          "Content-Type": "application/json"
        },
        data: {
          listId: this.data.wishListID,
          listDescription2: this.data.listDescription2,
          listDescription: this.data.listDescription,
          listDueTime: this.data.listDueTime,
          implementorsLimit: this.data.implementorsLimit
        },
        success(result) {
          console.log("请求成功");
          console.log(result);
          if (result.data.error) {
            console.log(result.data.error);
          } else {
            // wx.navigateTo({ url: "../main_new/main" });
            // wx.redirectTo({
            //   url: "../main/main"
            // });
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
      console.log("Exception happen when update wish content!");
      console.log(e);
    }
  },

  showDatePicker: function(e) {
    if (this.data.timeout || !this.data.canDelete) return;
    this.pickerShow();
  },
  hideDatePicker: function(e) {
    this.setData({
      datePickerIsShow: false
    });
  },
  confirmDate: function(e) {
    console.log(e);
    // let dateArr = e.detail.value;
    // this.setData({
    //   year: dateArr[0],
    //   month: dateArr[1],
    //   currentDate: dateArr[2],
    //   listDueTime: dateArr[0] + "-" + dateArr[1] + "-" + dateArr[2],
    //   datePickerIsShow: false
    // });
    // console.log(this.data.listDueTime);
    this.updateWishList();
  },

  addWishList: function(e) {
    console.log("add wish event");
    var newWishes = this.data.wishes;
    var tempId = (Math.floor(Math.random() * 100000) + 1) * -1;
    console.log("tempID is " + tempId);
    var newWish = {
      wishStatus: "NEW",
      description: "",
      wishID: tempId
    };
    newWishes.push(newWish);
    this.setData({
        wishes: newWishes
      },
      () => {
        Poster.updatePosterConfig();
      }
    );
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
      this.data.wishes[index].moveForDelete = "touch-move-active";
    }
    if (touchMoveX - startX > 50) {
      console.info("right move for " + index);
      this.data.wishes[index].moveForDelete = "";
    }
    that.setData({
      wishes: that.data.wishes
    });
  },

  delWish: function(e) {
    var index = e.currentTarget.dataset.index;
    var wishID = this.data.wishes[index].wishID;
    console.info("delete wish id " + wishID + " with index " + index);
    if (wishID > 0) {
      //Positive wish ID means a valid item in backend DB, otherwise, just a temp item in UI
      this.deleteWish(this.data.wishes[index].wishID);
    }
    this.loadWish();
  },

  onPosterSuccess: function(e) {
    const {
      detail
    } = e;
    wx.previewImage({
      current: detail,
      urls: [detail]
    });
    // 保存
    Poster.onSavePic();
  },
  onPosterFail: function(err) {
    console.error(err);
  },
  pickerHide: function() {
    this.setData({
      isPickerShow: false
    });
  },
  setPickerTime: function(val) {
    let data = val.detail;
    console.log(data);

    this.setData({
      listDueTime: data.startTime.substr(0, 14) + "59:59"
    });
    this.confirmDate();
  },
  pickerShow: function() {
    this.setData({
      isPickerShow: true,
      isPickerRender: true
    });
  },
  onSelectPic: function(e) {
    const dataset = e.target.dataset;
    this.setData({
      selectPicIndex: dataset.id,
      wishimage: this.data.pics[dataset.id]
    });
  },
  onDeleteWish: function() {
    let that = this;
    sdk.request({
      url: app.globalData.apiBase + `/v1/wishes/lists`,
      method: "DELETE",
      header: {
        "Content-Type": "application/json"
      },
      data: {
        listId: this.data.wishListID,
        listOpenId: app.globalData.authInfo.openid
      },
      success(res) {
        wx.navigateBack();
      },
      fail(error) {
        util.showModel("请求失败,请检查网络", error);
        console.log("request fail", error);
      }
    });
  },
  formSubmit(e) {
    console.warn(e.detail.formId);
    this.setData({
      formId: e.detail.formId
    });
  },
});