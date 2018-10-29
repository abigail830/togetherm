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
    wishes: [],
    listDescription: '',
    listDueTime: null,
    // headerText: "愿望列表",
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
  onLoad: function (options) {
    console.log(options);
    if (options.wishListId == null) {
      console.log("wishListId is null");
    } else {
      this.setData({
        wishListId: options.wishListId,
        nickName: options.nickName
      })
      return Promise.all([
        util.request(app.globalData.apiBase + "/v1/wishes?" + "wishListId=" + this.data.wishListId)
          .then((res) => {
            console.log(res.data);
            this.setData({
              wishes: res.data.wishes,
              listDescription: res.data.listDescription,
              listDueTime: res.data.listDueTime,
              year: res.data.listDueTime.substring(0, 4),
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

  takeupWish: function (e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.wishes[index];
    console.log(item);
    console.log("wish id to be take up " + item.wishID);
    try {
      sdk.request({
        url: app.globalData.apiBase + `/v1/wishes`,
        method: 'PUT',
        header: { "Content-Type": "application/json" },
        data: {
          "wishID": item.wishID,
          "description": item.description,
          "wishListID": item.wishListID,
          "wishStatus": 'TAKEUP',
          "implementor": {
            "openId": app.globalData.authInfo.openid,
            "gender": app.globalData.userInfo.gender,
            "nickName": app.globalData.userInfo.nickName,
            "city": app.globalData.userInfo.city,
            "country": app.globalData.userInfo.country,
            "province": app.globalData.userInfo.province,
            "avatarUrl": app.globalData.userInfo.avatarUrl,
            "language": app.globalData.userInfo.language,
          }
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
      console.log('Exception happen when update wish content!');
      console.log(e);
    }
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


})