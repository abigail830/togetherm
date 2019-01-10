const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (
    [year, month, day].map(formatNumber).join("/") +
    " " +
    [hour, minute, second].map(formatNumber).join(":")
  );
};

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : "0" + n;
};

const range = (start, end) =>
  new Array(end - start + 1).fill(start).map((el, i) => start + i);

const pad = (n, width, z) => {
  z = z || "0";
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

const showSuccess = text =>
  wx.showToast({
    title: text,
    icon: "success"
  });

const showModel = (title, content) => {
  wx.hideToast();

  wx.showModal({
    title,
    content: JSON.stringify(content),
    showCancel: false
  });
};

const shorten = (content, length) => {
  return content.length > length ? content.substr(0, length) + "..." : content;
};

const showLoading = text =>
  wx.showToast({
    title: text,
    icon: "loading",
    duration: 1000
  });

const parameterMap = {
  gender: [
    { id: 1, key: "male", name: "男" },
    { id: 2, key: "female", name: "女" }
  ],
  treatmentMethod: [
    { id: 1, key: "medication", checked: false, name: "药物治疗" },
    { id: 2, key: "hemodialysis", checked: false, name: "血液透析治疗" },
    { id: 3, key: "peritoneal-dialysis", checked: false, name: "腹膜透析治疗" },
    { id: 4, key: "transplantation", checked: false, name: "肾脏移植" }
  ],
  sportRate: [
    { id: 1, key: "light", name: "轻度（如：长期坐办公室）" },
    { id: 2, key: "medium", name: "中度（如：不时外出跑业务）" },
    { id: 3, key: "severe", name: "重度（如：搬运）" }
  ],
  otherDisease: [
    //高血压/高血脂（甘油三酯/胆固醇/both）/高血糖/高尿酸/无
    { id: 1, key: "hypertension", checked: false, name: "高血压" },
    { id: 2, key: "triglyceride", checked: false, name: "高甘油三酯" },
    { id: 3, key: "cholesterol", checked: false, name: "高胆固醇" },
    { id: 4, key: "hyperglycemia", checked: false, name: "高血糖" },
    { id: 5, key: "hyperuricacidemia", checked: false, name: "高尿酸" }
  ],
  irritability: [
    //奶/蛋/贝壳/虾蟹鱼/面粉/坚果/黄豆/玉米
    { id: 1, key: "milk", checked: false, name: "奶" },
    { id: 2, key: "egg", checked: false, name: "蛋" },
    { id: 3, key: "crostacei", checked: false, name: "贝壳" },
    { id: 4, key: "fish-prawn-crab", checked: false, name: "鱼虾蟹" },
    { id: 5, key: "flour", checked: false, name: "面粉" },
    { id: 6, key: "nuts", checked: false, name: "坚果" },
    { id: 7, key: "soya", checked: false, name: "黄豆" },
    { id: 8, key: "corn", checked: false, name: "玉米" }
  ]
};

const getAliasSingleOption = (options, value) =>
  parameterMap[options].filter(item => item.key === value)[0].name;

const getAliasMultiOption = (options, value) =>
  parameterMap[options]
    .filter(item => value.includes(item))
    .map(item => item.name)
    .join(",");

const cutMessage = (source, length) =>
  source.length > length ? source.substr(0, length) + "..." : source;

const getCurrentPageUrl = () => {
  let pages = getCurrentPages();
  let currentPage = pages[pages.length - 1];
  return currentPage.route;
};

const getCurrentPageUrlWithArgs = () => {
  let pages = getCurrentPages();
  let currentPage = pages[pages.length - 1];
  let url = currentPage.route;
  let options = currentPage.options;

  let urlWithArgs = url + "?";
  for (let key in options) {
    let value = options[key];
    urlWithArgs += key + "=" + value + "&";
  }
  urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1);

  return { url: urlWithArgs, keys: options, page: currentPage };
};

const networkTypePromise = () =>
  new Promise((resolve, reject) => {
    let req = wx.getNetworkType({
      success: function(res) {
        var networkType = res.networkType;
        if (networkType === "none") {
          resolve(false);
        } else {
          resolve(true);
        }
      },
      fail() {
        reject(false);
      }
    });
    console.log(req);
  });

const request = (url, data, header, method) => {
  return new Promise((resolve, reject) => {
    let header = header || {};
    let data = data || {};
    wx.request({
      url: url,
      method: method || "GET",
      data: data,
      header: {
        ...header
      },
      dataType: "json",
      success: resolve,
      fail: reject
    });
  });
};
const shareDate = (title, imageUrl, path) => {
  let globalData = getApp().globalData;
  const entrance = globalData.entrance;
  const pages = getCurrentPages();
  var currentPage = path || "/pages/index_new/index_new";
  const opt = Object.assign(
    {
      title: title || "友爱契约",
      path: entrance
        ? currentPage +
          (currentPage.indexOf("?") >= 0 ? "&" : "?") +
          "entrance=" +
          entrance
        : currentPage,
      success: function(res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function(res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    },
    imageUrl
      ? { imageUrl: imageUrl }
      : imageUrl === null
      ? { imageUrl: "../../images/LOGO.png" }
      : {}
  );
  console.log(opt);

  return opt;
};
module.exports = {
  formatTime: formatTime,
  formatNumber: formatNumber,
  range: range,
  pad: pad,
  shorten: shorten,
  showSuccess: showSuccess,
  showModel: showModel,
  showLoading: showLoading,
  parameterMap: parameterMap,
  getAliasSingleOption: getAliasSingleOption,
  cutMessage: cutMessage,
  getAliasMultiOption: getAliasMultiOption,
  getCurrentPageUrl: getCurrentPageUrl,
  getCurrentPageUrlWithArgs: getCurrentPageUrlWithArgs,
  networkTypePromise: networkTypePromise,
  request: request,
  shareDate: shareDate,
  // 封面图列表
  posterImages: i => {
    let globalData = getApp().globalData;
    const entrance = globalData.entrance || "default";
    const images = globalData.status || {
      default: [
        "/images/0.jpg",
        "/images/1.jpg",
        "/images/2.jpg",
        "/images/3.jpg",
        "/images/4.jpg",
        "/images/5.jpg",
        "/images/6.jpg",
        "/images/7.jpg",
        "/images/8.jpg"
      ],
      dt: ["/images/dt-0.png"],
      ts: ["/images/ts-0.png", "/images/ts-1.png"]
    };
    let lists = images[entrance] || images["default"];
    if (globalData.status) {
      lists = lists.map(e => {
        return globalData.statusBase + e;
      });
    }
    const res = typeof i === "undefined" ? lists : lists[i];
    console.warn("获取图片", typeof i, i, entrance, res);
    return res;
  }
};
