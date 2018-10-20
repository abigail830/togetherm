// pages/wishList/wishList.js
let util = require('../../utils/util.js');
const app = getApp()
const currentYear = new Date().getFullYear();
const currentMonth = util.formatNumber(new Date().getMonth() + 1);
const currentDate = util.formatNumber(new Date().getDate());

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wishes:[],
    resultCode: null,
    listDescription: '',
    listDueTime: null,
    headerText: "愿望列表",
    datePickerIsShow: false,
    datePickerValue: [currentYear, currentMonth, currentDate],
    year: currentYear,
    month: currentMonth,
    currentDate: currentDate,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.wishListID==null){
      console.log("Going to create new wishlist");
    }else{
      return Promise.all([
        util.request(app.globalData.apiBase + "/wish?" + "wishListId=" + options.wishListID)
          .then((res) => {
            console.log(res.data);
            this.setData({
              wishes: res.data.wishes,
              resultCode: res.data.resultCode,
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
  onShareAppMessage: function () {

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
    // this.loadFood();
  },



})