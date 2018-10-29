// pages/wishList/wishList.js
let util = require('../../utils/util.js');
const app = getApp();
let sdk = require('../../vendor/wafer2-client-sdk/index');

const currentYear = new Date().getFullYear();
const currentMonth = util.formatNumber(new Date().getMonth() + 1);
const currentDate = util.formatNumber(new Date().getDate());

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wishes:[],
    listDescription: '',
    listDueTime: null,
    // headerText: "愿望列表",
    datePickerIsShow: false,
    datePickerValue: [currentYear, currentMonth, currentDate],
    year: currentYear,
    month: currentMonth,
    currentDate: currentDate,
    wishListID: null,
    touchMoveIndex: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.wishListID==null){
      console.log("Going to create new wishlist ");
      this.postWishList();
    }else{
      this.setData({
        wishListID: options.wishListID
      })
      console.log(this.data.wishListID);
      return Promise.all([
        util.request(app.globalData.apiBase + "/v1/wishes?" + "wishListId=" + options.wishListID)
          .then((res) => {
            console.log(res.data);
            this.setData({
              wishes: res.data.wishes,
              listDescription: res.data.listDescription,
              listDueTime: res.data.listDueTime,
              year: res.data.listDueTime.substring(0,4),
              month: res.data.listDueTime.substring(5, 7),
              currentDate: res.data.listDueTime.substring(8, 10),
            })
          }, (res) => {
            util.showModel('获取您的愿望', res.errMsg)
          })
      ]).then(() => {
        wx.hideLoading();
      });
    }
  },

  loadWish: function () {
    util.request(app.globalData.apiBase + "/v1/wishes?" + "wishListId=" + this.data.wishListID)
      .then((res) => {
        console.log(res.data);
        this.setData({
          wishes: res.data.wishes
        })
      });
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
  onShareAppMessage: function (options) {
    if (options.from == 'button') {
      console.log(this.data.wishListID);    
      var nick_name = app.globalData.userInfo.nickName;
      return {
        title: nick_name +'的小心愿',
        path: '/pages/shareIndex/shareIndex?wishListId=' + this.data.wishListID + '&nickName=' + nick_name,
        imageUrl: '../../images/guide1.jpg',
        success: function (res) {
          console.log("清单分享成功:" + JSON.stringify(res));
        },
        fail: function (res) {
          console.log("清单分享失败:" + JSON.stringify(res));
        }
      }
    }else{
      return {
        title: '友爱清单',
        imageUrl: '../../images/guide1.jpg',
        success: function (res) {
          // 转发成功
          console.log("转发成功:" + JSON.stringify(res));
        },
        fail: function (res) {
          // 转发失败
          console.log("转发失败:" + JSON.stringify(res));
        }
      }
    }  
  },

  bindKeyInput: function (e) {
    this.setData({
      listDescription: e.detail.value
    })
  },

  bindWishKeyInput: function (e) {
    var id = e.currentTarget.dataset.id;
    var value = e.detail.value;
    var item = this.data.wishes[id];
    item.description = value;
    console.log(this.data.wishes);
  },

  postWishList: function () {
    console.log("add wish list ");
    var myPage = this;
    try {
      sdk.request({
        url: app.globalData.apiBase + `/v1/wishes/lists`,
        method: 'POST',
        header: { "Content-Type": "application/json" },
        data: {
          "listDescription": "我的新愿望",
          "listDueTime": currentYear + "-" + currentMonth + "-" + currentDate,
          "listOpenId": app.globalData.authInfo.openid
        },
        success(result) {
          console.log("请求成功");
          console.log(result);
          myPage.setData({
            wishListID: result.data.listId,
            listDescription: result.data.listDescription,
            listDueTime: result.data.listDueTime
          });
          if (result.data.error) {
            console.log(result.data.error);
          } else {
            wx.redirectTo({
              url: '../index_after_authorize/index_after'
            });
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
      console.log('Exception happen when update wish content!');
      console.log(e);
    }

  },

  addWish: function (itemID) {
    var item = this.data.wishes[itemID];
    console.log("add wish id to be change " + item.wishID);
    console.log("add new wish to wishList id " + this.data.wishListID);
    try {
      sdk.request({
        url: app.globalData.apiBase + `/v1/wishes`,
        method: 'POST',
        header: { "Content-Type": "application/json" },
        data: {
          "description": item.description,
          "wishListID": this.data.wishListID,
          "wishStatus": "NEW"
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
          } else {
            wx.switchTab({
              url: '../index_after_authorize/index_after'
            });
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
      console.log('Exception happen when update wish content!');
      console.log(e);
    }

  },

  updateWish: function (itemID) {
    var item = this.data.wishes[itemID];
    console.log("update wish id to be change " + item.wishID);
    console.log("update wish desc changed to " + item.description);
    console.log("update wishList id " + this.data.wishListID);
    try {
      sdk.request({
        url: app.globalData.apiBase + `/v1/wishes`,
        method: 'PUT',
        header: { "Content-Type": "application/json" },
        data: {
          "wishID": item.wishID,
          "description": item.description,
          "wishListID": this.data.wishListID,
          "wishStatus": item.wishStatus
        },
        success(result) {
          console.log("请求成功");
          console.log(result);
          if (result.data.error) {
            console.log(result.data.error);
          } else {
            wx.redirectTo({
              url: '../index_after_authorize/index_after'
            });
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
      console.log('Exception happen when update wish content!');
      console.log(e);
    }
  },

  deleteWish: function (wishID) {
    console.log("Going to delete wish id: " + wishID);
    try {
      sdk.request({
        url: app.globalData.apiBase + `/v1/wishes`,
        method: 'DELETE',
        header: { "Content-Type": "application/json" },
        data: {
          "wishID": wishID
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
  },

  bindDescCompleted: function (e) {
    var id = e.currentTarget.dataset.id;
    var item = this.data.wishes[id];
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
      console.info("Wish desciption is empty, ignore...")
    }

  },



  showDatePicker: function (e) {
    this.setData({
      datePickerIsShow: true,
      datePickerValue: [this.data.year, this.data.month, this.data.currentDate]
    });
  },
  hideDatePicker: function (e) {
    this.setData({
      datePickerIsShow: false,
    });
  },
  confirmDate: function (e) {
    console.log(e);
    let dateArr = e.detail.value;
    this.setData({
      year: dateArr[0],
      month: dateArr[1],
      currentDate: dateArr[2],
      listDueTime: dateArr[0] + '-' + dateArr[1] + '-' + dateArr[2],
      datePickerIsShow: false
    });
    console.log(this.data.listDueTime);
  },
 
  addWishList: function(e) {
    console.log("add wish event");
    var newWishes = this.data.wishes;
    var tempId = (Math.floor(Math.random() * 100000) + 1) * -1; 
    console.log("tempID is " + tempId)
    var newWish = { "wishStatus": "NEW", "description": "","wishID":tempId};
    newWishes.push(newWish);
    this.setData({
      wishes: newWishes,
    });
  },

  delWishList: function (e) {
    console.log("remove wish event");
  },

  confirmAndBack: function(e){
    //This is going for HTTP POST/PUT for info update
    try {
      sdk.request({
        url: app.globalData.apiBase + `/wishes`,
        method: 'POST',
        header: { "Content-Type": "application/json" },
        data: {
          wishes: this.data.wishes,
          listDueDate: this.data.listDueDate,
          listDescription: this.data.listDescription
        },
        success(result) {
          console.log("请求成功");
          console.log(result.data);

          //http response code 200/404/500..etc 
          if (result.data.error){
            console.log(result.data.error);
          }else{
            app.initWishLists();
            wx.redirectTo({
              url: '../index_after_authorize/index_after'
            });
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
      console.log('Exception happen when update wish content!');
      console.log(e);
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
    var  index = e.currentTarget.dataset.index;
    var  startX = that.data.startX;
    var  touchMoveX = e.changedTouches[0].clientX;
    if ((startX - touchMoveX) > 50) {
      console.info("left move for " + index);
      this.data.wishes[index].moveForDelete = "touch-move-active";
    }
    if ((touchMoveX - startX) > 50) {
      console.info("right move for " + index);
      this.data.wishes[index].moveForDelete = "";
    }
    that.setData({
      wishes: that.data.wishes
    })
  },

  delWish: function (e) {
    var index = e.currentTarget.dataset.index;
    var wishID = this.data.wishes[index].wishID;
    console.info("delete wish id " + wishID + " with index " + index);
    if (wishID > 0) {
      //Positive wish ID means a valid item in backend DB, otherwise, just a temp item in UI
      this.deleteWish(this.data.wishes[index].wishID);
    }
    this.loadWish();
  }

})