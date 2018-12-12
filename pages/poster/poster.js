// const Poster = require('../../vendor/weapp-poster/poster');
const app = getApp();
const globalData = app.globalData;
let Poster, PosterData, userInfo;
Page({
  data: {
    posterConfig: {},
    nickname: "Tanzhiping",
    wishlist: [
      { title: "我是测试的" },
      { title: "我是测试的" },
      { title: "我是测试的" },
      { title: "我是测试的" },
      { title: "我是测试的" },
      { title: "我是测试的" }
    ],
    wishname: "圣诞节心愿清单圣诞节心愿清单圣诞节心愿清单圣诞节心愿清单",
    wishinfo:
      "望愿望描述愿望愿描述愿望描述愿望描述愿望描述愿望愿望描述愿望描述愿望描述愿望描述愿望描述愿望描述望愿描述愿望描述愿望描述愿望描述愿望愿望描述愿望描述愿望描述愿望描述愿望描述愿望描述望愿描述愿望描述愿望描述愿望描述愿望愿望描述愿望描述愿望描述愿望描述愿望描述愿望描述望愿描述愿望描述愿望描述愿望描述愿望愿望描述愿望描述愿望描述愿望描述愿望描述愿望描述望愿描述愿望描述愿望描述愿望描述愿望愿望描述愿望描述愿望描述愿望描述愿望描述愿望描述"
  },
  onPosterSuccess(e) {
    const { detail } = e;
    PosterData = detail;
    wx.hideLoading();
    this.onSavePic();
    wx.previewImage({
      current: detail,
      urls: [detail]
    });
  },
  onPosterFail(err) {
    console.error(err);
  },

  updatePosterConfig() {
    const fontColor = "#6A3906";
    const boxWidth = 672;
    const boxLeft = 40;
    const boxTop = 680;
    const titleHeight = 40;
    const boxSpacing = 20;

    const wishnameData = (() => {
      return {
        x: boxLeft,
        y: boxTop,
        width: boxWidth,
        fontBold: true,
        text: this.data.wishname,
        fontSize: titleHeight,
        color: fontColor,
        lineNum: 1,
        h: titleHeight
      };
    })();

    const nicknameData = (() => {
      return {
        x: boxLeft / 2 + boxWidth,
        y: boxTop + titleHeight + boxSpacing,
        width: boxWidth,
        text: this.data.nickname,
        fontSize: titleHeight,
        fontBold: true,
        color: fontColor,
        lineNum: 1,
        h: titleHeight,
        textAlign: "right"
      };
    })();
    const contentData = (() => {
      let data = {
        x: boxLeft + 5,
        y: nicknameData.y + nicknameData.h + boxSpacing,
        width: boxWidth - 10,
        text: this.data.wishinfo,
        fontSize: 32,
        color: fontColor,
        lineNum: 0
      };
      const line = Poster.getTextLine(data, boxWidth - 10);
      data.height = data.fontSize * 1.5;
      data.h = line * data.height;
      data.lineHeight = data.fontSize;
      return data;
    })();
    let wishlist = [],
      wishlistFontSize = 34,
      lines = [],
      images = [
        {
          url: "/images/LOGO.png",
          width: 167,
          height: 54,
          y: 20.7 * 2,
          x: 20.65 * 2
        },
        {
          url: "/images/poster-default.png",
          width: 335 * 2,
          height: 250 * 2,
          y: 60 * 2,
          x: 20 * 2,
          borderRadius: 25,
          borderWidth: 6,
          borderColor: "#6A3906"
        }
      ];
    const blocksData = (() => {
      const borderWidth = 4;
      const padding = 60;
      const wishlistLen = this.data.wishlist.length;
      let height =
        wishlistLen * wishlistFontSize +
        borderWidth * 2 +
        padding * wishlistLen;
      let y = contentData.y + contentData.h;
      let maxHeight = 0;
      let data = {
        x: boxLeft,
        y: y,
        width: boxWidth,
        height: height,
        expand: false,
        borderWidth: borderWidth,
        borderRadius: 25,
        borderColor: fontColor
      };
      this.data.wishlist.forEach((e, i) => {
        let k = i + 1;
        let top = y + (wishlistFontSize + padding) * k;
        wishlist.push({
          text: `${k}    ${e.title}`,
          fontSize: wishlistFontSize,
          y: top - padding / 2,
          x: boxLeft + 30,
          color: fontColor
        });
        images.push({
          url: "/images/poster-btn.png",
          width: 130,
          height: 50,
          y: top - padding - 6,
          x: 278 * 2
        });
        if (i < wishlistLen - 1) {
          lines.push({
            startY: top,
            startX: boxLeft * 2,
            endX: boxWidth + boxLeft - borderWidth / 2,
            endY: top,
            width: 2,
            color: "#E5E5E5"
          });
        } else {
          top = top + 50;
          images.push({
            url: "/images/poster-qr.png",
            width: 160,
            height: 160,
            y: top,
            x: 750 - 160 - boxLeft
          });
          wishlist.push(
            {
              text: `实现日期：`,
              fontBold: true,
              fontSize: 36,
              y: top + 30 + 36,
              x: boxLeft,
              color: fontColor
            },
            {
              text: `2018年12月25日 10:46`,
              fontBold: true,
              fontSize: 36,
              y: top + 30 * 3 + 36,
              x: boxLeft,
              color: fontColor
            }
          );
        }
      });
      return data;
    })();

    let height = blocksData.y + blocksData.height + 250;
    let posterConfig = {
      width: 750,
      height: height,
      backgroundColor: "#fff",
      reload: true,
      blocks: [blocksData],
      texts: [wishnameData, nicknameData, contentData, ...wishlist],
      images: images,
      lines: lines
    };
    this.setData({ posterConfig: posterConfig });
  },
  createPoster() {
    wx.showLoading({ mask: true, title: "生成中" });
    this.updatePosterConfig();
    Poster.onCreate();
  },
  onSavePic() {
    const downloadImage = () => {
      wx.saveImageToPhotosAlbum({
        filePath: PosterData,
        success(res) {
          wx.showToast({
            title: "海报已保存",
            icon: "success",
            duration: 2000
          });
        },
        fail(err) {
          console.error(err);
        }
      });
    };
    wx.getSetting({
      success(res) {
        console.log("getSetting: success");
        if (!res.authSetting["scope.writePhotosAlbum"]) {
          wx.authorize({
            scope: "scope.writePhotosAlbum",
            success() {
              downloadImage();
            },
            fail() {
              console.log("授权权限失败");
            }
          });
        } else {
          downloadImage();
        }
      }
    });
  },
  getUserInfo() {
    const setUser = info => {
      userInfo = info;
      this.setData({ nickname: info.nickName });
      console.log(info);
    };
    if (app.globalData.userInfo) {
      setUser(globalData.userInfo);
    } else if (this.data.canIUse) {
      app.userInfoReadyCallback = res => {
        setUser(res.userInfo);
      };
    } else {
      wx.getUserInfo({
        success: res => {
          setUser((app.globalData.userInfo = res.userInfo));
        }
      });
    }
  },
  onLoad() {
    Poster = this.selectComponent("#weapp-poster");
    this.getUserInfo();
    // this.createPoster();
  }
});
