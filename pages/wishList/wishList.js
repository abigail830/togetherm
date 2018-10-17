// pages/wishList/wishList.js
let util = require('../../utils/util.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wishes:[],
    hasWish: false,
    headerText: "愿望列表"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.wishListID==null){
      console.log("Going to create new wishlist");
    }else{
      return Promise.all([
        util.request(app.globalData.apiBase + "/wish/details?" + "wishListId=" + options.wishListID)
          .then((res) => {
            console.log(res.data);
            this.setData({
              wishes: res.data.wishes,
              hasWish: res.data.hasWish
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

  }
})