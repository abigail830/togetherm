// pages/index/guide/guide.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgs: [
      // "https://kidneyhealty.com.cn/images/guide1.jpg",     
      "../../images/guide1.jpg",
      "",
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  swiperChange: function (e) {
    if (e.detail.current == this.data.imgs.length-1){
      console.log("End swiper and going to redirect to index");
      wx.switchTab({
        url: '../index/index',
      })
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