//logs.js
const util = require("../../utils/util.js");

Page({
  data: {
    logs: [],
    listDueTime: "",
    isPickerRender: false,
    isPickerShow: false,
    timePickerConfig: {
      confirmColor: "#F08080",
      column: "hour"
    }
  },
  onLoad() {},
  pickerHide() {
    this.setData({
      isPickerShow: false
    });
  },
  setPickerTime(val) {
    let data = val.detail;
    console.log(data);
    this.setData({ listDueTime: data.startTime });
  },
  pickerShow() {
    this.setData({
      isPickerShow: true,
      isPickerRender: true
    });
  }
});
