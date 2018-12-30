const app = getApp();
let userInfo, Poster, PosterData;
Component({
  properties: {
    save: {
      type: Boolean,
      value: true
    },
    date: {
      type: String,
      value: ""
    },
    tip: {
      type: String,
      value: "海报生成中"
    },
    wishlist: {
      type: Array,
      value: []
    },
    wishname: {
      type: String,
      value: ""
    },
    wishimage: {
      type: String,
      value: ""
    },
    wishinfo: {
      type: String,
      value: ""
    }
  },
  data: {
    nickname: "",
    posterConfig: {}
  },
  methods: {
    onPosterSuccess(e) {
      const { detail } = e;
      PosterData = detail;
      wx.hideLoading();
      // this.onSavePic();
      this.triggerEvent("success", detail);
    },
    onPosterFail(err) {
      this.triggerEvent("fail", err);
    },

    updatePosterConfig(fn) {
      console.log(this.data);

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
          textAlign: "right",
          //   x: boxLeft,
          y: boxTop + titleHeight + boxSpacing,
          width: boxWidth,
          text: " -- " + this.data.nickname,
          fontSize: titleHeight - 4,
          fontBold: true,
          color: fontColor,
          lineNum: 1,
          h: titleHeight - 16
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
            width: 199.68, // 355 96
            height: 54,
            y: 20.7 * 2,
            x: 20.65 * 2
          },
          {
            url: this.data.wishimage || "/images/poster-default.png",
            width: 335 * 2,
            height: 250 * 2,
            y: 120,
            x: 40,
            borderRadius: 25,
            borderWidth: 12,
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
        const setFooter = top => {
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
              text: `有效日期：`,
              fontBold: true,
              fontSize: 36,
              y: top + 30 + 36,
              x: boxLeft,
              color: fontColor
            },
            {
              text: this.data.date,
              fontBold: true,
              fontSize: 36,
              y: top + 30 * 3 + 36,
              x: boxLeft,
              color: fontColor
            }
          );
        };
        if (wishlistLen <= 0) {
          setFooter(y);
          return {};
        }
        this.data.wishlist.forEach((e, i) => {
          let k = i + 1;
          let top = y + (wishlistFontSize + padding) * k;
          wishlist.push({
            text: `${k}    ${e.description}`,
            fontSize: wishlistFontSize,
            y: top - padding / 2,
            lineNum: 1,
            x: boxLeft + 30,
            color: fontColor,
            width: 500
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
            setFooter(top);
          }
        });
        return data;
      })();

      let height = Object.keys(blocksData).length
        ? blocksData.y + blocksData.height + 250
        : 1020;
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
      console.log(posterConfig);

      this.setData({ posterConfig: posterConfig }, () => {
        fn && fn(Poster);
      });
    },
    createPoster() {
      wx.showLoading({ mask: true, title: this.data.tip });
      this.updatePosterConfig(() => {
        Poster.onCreate();
      });
    },
    onSavePic() {
      const downloadImage = () => {
        console.log(this.data.save);
        if (!this.data.save) return;
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
        this.setData({ nickname: info.nickName }, () => {
          this.updatePosterConfig();
        });
        console.log(this.data, userInfo);
      };
      if (app.globalData.userInfo) {
        setUser(app.globalData.userInfo);
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
    }
  },
  created() {
    Poster = this.selectComponent("#weapp-poster");
    this.getUserInfo();
  }
});
