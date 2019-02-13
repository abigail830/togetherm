//app.js
let util = require("utils/util.js");
App({
  onLaunch: function() {
    // 展示本地存储能力
    let logs = wx.getStorageSync("logs") || [];
    this.getStatus();
    logs.unshift(Date.now());
    wx.setStorageSync("logs", logs);
    this.bindNetworkChangeRefresh();
    this.wxLogin();
    let that = this;
    wx.getSystemInfo({
      success(res) {
        that.globalData.x = res.windowHeight / res.windowWidth;
      }
    });
  },
  wxLogin: function() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          console.log(res);
          wx.setStorageSync("wx_code", res.code);
          const header = {
            "X-WX-Code": res.code
          };
          console.log("登录中...");
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          wx.request({
            url: this.globalData.apiBase + "/common/wxLogin",
            method: "GET",
            header: header,
            dataType: "json",
            complete: res => {
              // wx.hideLoading();
            },
            success: resolve,

            fail: reject
          });
        }
      });
    }).then(
      result => {
        wx.setStorageSync("skey", result.data.session_key);
        wx.setStorageSync("openid", result.data.openid);
        console.log("登录后台成功");
        console.log(this.globalData);

        this.globalData.authInfo.skey = result.data.session_key;
        this.globalData.authInfo.openid = result.data.openid;
        // this.initWishLists();

        // 获取用户信息
        wx.getSetting({
          success: res2 => {
            if (res2.authSetting["scope.userInfo"]) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res3 => {
                  console.log(res3);
                  if (res3.iv && res3.encryptedData) {
                    wx.request({
                      url: this.globalData.apiBase + "/common/decrypt",
                      method: "GET",
                      header: {
                        iv: res3.iv,
                        encryptedData: res3.encryptedData,
                        appId: "wxa823794835f994b3",
                        skey: result.data.session_key
                      },
                      dataType: "json",
                      complete: res => {
                        // wx.hideLoading();
                      },
                      success: result2 => {},

                      fail: result2 => {
                        util.showModel("登录后台错误", result2.msg);
                      }
                    });
                  }
                  // 可以将 res 发送给后台解码出 unionId
                  this.globalData.userInfo = res3.userInfo;

                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(res3);
                  }
                }
              });
            }
          }
        });
      },
      result => {
        util.showModel("登录后台错误", result.errMsg);
      }
    );
  },
  bindNetworkChangeRefresh: function() {
    util
      .networkTypePromise()
      .then(isConnected => (this.globalData.isNetworkConnected = isConnected))
      .catch(isConnected => (this.globalData.isNetworkConnected = isConnected));
    wx.onNetworkStatusChange(res => {
      if (res.networkType === "none") {
        this.globalData.isNetworkConnected = false;
        wx.showToast({
          title: "当前没有网络!",
          mask: true,
          icon: "loading",
          duration: 1000
        });
      } else if (res.isConnected) {
        if (!this.globalData.isNetworkConnected) {
          let networkResumeCallback = () => {
            let curpage = util.getCurrentPageUrlWithArgs();
            curpage.page.onLoad(curpage.keys);
            curpage.page.onShow();
            this.globalData.isNetworkConnected = true;
          };
          let promiseList = [];
          if (!this.globalData.authInfo.openid) {
            promiseList.push(this.wxLogin());
          }

          if (promiseList.length !== 0) {
            Promise.all(promiseList).then(networkResumeCallback, () => {});
          } else {
            networkResumeCallback();
          }
        }
      } else {
        // for Android Unknown status
        this.globalData.isNetworkConnected = false;
        wx.showToast({
          title: "网络情况异常!",
          image: this.globalData.imageBasePath + "/public/error.png",
          mask: true,
          duration: 1000
        });
      }
    });
  },

  globalData: {
    authInfo: {
      skey: null,
      openid: null
    },
    isNetworkConnected: true,
    userInfo: null,
    apiBase: "https://wishlist.rabbit-hop.com",
    statusBase: "https://wishlist.rabbit-hop.com/images/",
    myCompletedWishCount: null,
    myFriendsCompletedWishCount: null,
    wishLists: [],
    hasWishList: false,
    timeline: [],
    status: null,
    types: [],
    postCoupon: false,
    repeatTipCard: null,
    iconDone: ""
  },

  getStatus() {
    util.request(this.globalData.statusBase + "/status.json").then(
      e => {
        console.log(e);
        this.globalData.status = e.data.lists;
        this.globalData.types = e.data.types;
        this.globalData.postCoupon = e.data.postCoupon;
        this.globalData.repeatTipCard = e.data.repeatTipCard;
        this.globalData.iconDone = util.iconDone(e.data.iconDone);
      },
      res => {
        util.showModel("获取契约海报失败", res.errMsg);
      }
    );
  }
});
