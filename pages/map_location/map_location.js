
let QQMapWX = require('./qqmap-wx-jssdk.js');

Page({
  data: {
    addressList: [],
    currentLat:'',
    currentLon:'',
    markers:[]
  },
  onLoad: function (options) {
    this.getCurrentLocation()
    // this.configMap()
  },
  onReady: function () {
  
  },
  onShow: function () {
  
  },
  onHide: function () {
  
  },
  onUnload: function () {
  
  },
  onPullDownRefresh: function () {
  
  },
  onReachBottom: function () {
  
  },
  onShareAppMessage: function () {
  
  },
  getCurrentLocation: function () {
    let that = this;
    wx.getLocation({
      success: function(res) {
        let latitude = res.latitude
        let longitude = res.longitude
        console.log('location',res)
        that.setData({
          currentLat:latitude,
          currentLon:longitude,
          markers: [{ latitude: latitude, longitude: longitude, iconPath:''}]
        })
        that.configMap();
      },
    })
  },

  configMap () {
    let that = this;
    let qqmapsdk = new QQMapWX({
      key: 'IDKBZ-XGB64-VFLUB-XYHW3-EIAXT-UGBXX'
    });
    qqmapsdk.getSuggestion({
      keyword: '麦当劳',
      location: {
        latitude: that.data.currentLat,
        longitude: that.data.currentLon
      },
      success (res) {
        console.log('qqmap_success',res);
      },
      fail (res) {
        console.log('qqmap_fail',res);
      },
      complete (res) {
        console.log('qqmap_complete',res);
        that.setData({
          addressList: res.data
        })
      }
    });
  },
  didSelectCell (e) {
    let index = e.currentTarget.dataset.id
    let locationData = this.data.addressList[index]
    let latitude = locationData.location.lat;//locationStr.split(',')[0]
    let longitude = locationData.location.lng;//locationStr.split(',')[1]
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];

    const address = locationData.address
    const title = locationData.title
    const location = longitude + ',' + latitude
    console.log(title, address, location)

    // wx.navigateBack({
    //   delta: 1
    // })
  },
  bindSearchTap: function () {
    wx.navigateTo({
      url: 'search_map_location/search_map_location',
    })
  }

})