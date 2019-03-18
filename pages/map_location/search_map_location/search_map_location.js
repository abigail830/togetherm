var QQMapWX = require('../qqmap-wx-jssdk.js');
let qqmapsdk = new QQMapWX({
  key: 'IDKBZ-XGB64-VFLUB-XYHW3-EIAXT-UGBXX'
});
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tips: [],
    istext: false,
    city: '',
    searchKey: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getInfo()
    // this.getCurrentLocation()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    wx.hideKeyboard();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  clickSearchView() {},
  bindKeyInput(e) {
    console.log(e);
    this.setData({
      searchKey: e.detail.value
    })
  },
  getCurrentLocation() {
    let that = this;
    wx.getLocation({
      success: function(res) {
        let latitude = res.latitude
        let longitude = res.longitude
        console.log('location', res)
      },
    })
  },
  getInfo() {
    let that = this
    qqmapsdk.reverseGeocoder({
      location: '',
      get_poi: 1,
      success(res) {
        res = res.result;
        if (res.address_component && res.address_component.city) {
          that.setData({
            city: res.address_component.city,
            tips: res.pois
          })
        }
      },
      fail: function(error) {
        console.error(error);
      }
    })
  },
  clickSearch: function(e) {
    let that = this;
    let keywords = that.data.searchKey;
    if (keywords == "") {
      wx.showModal({
        title: '温馨提示',
        content: "请输入地址",
        confirmColor: '#6A3906',
        showCancel: false,
      })
      return;
    }

    console.log(e);
    qqmapsdk.getSuggestion({
      keyword: keywords,
      region: this.data.city,
      size: 10,
      success(res) {
        console.log(res);
      },
      fail(res) {
        console.log('fail', res);
      },
      complete(res) {
        console.log('complete', res);
        let data = res.data
        that.setData({
          tips: [{
            title: keywords,
            address: ''
          }].concat(data)
        });
      }
    })
  },

  didSelectCell(e) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    let index = e.currentTarget.dataset.index;
    let locationData = this.data.tips[index];
    // locationData.address + 
    const address = locationData.title
    prevPage.setData({
      address: address
    })
    console.log(address)
    wx.navigateBack({
      delta: 1
    })
  }

})