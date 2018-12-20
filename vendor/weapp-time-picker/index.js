const getDate = date => {
  console.log(date);

  return typeof date === "string"
    ? new Date(date.replace(/ /g, "T"))
    : !!date
    ? new Date(date)
    : new Date();
};
Component({
  properties: {
    pickerShow: {
      type: Boolean,
      observer: function(val) {
        if (val) {
          let animation = wx.createAnimation({
            duration: 500,
            timingFunction: "ease"
          });
          let animationOpacity = wx.createAnimation({
            duration: 500,
            timingFunction: "ease"
          });
          setTimeout(() => {
            animation.bottom(0).step();
            animationOpacity.opacity(0.7).step();
            this.setData({
              animationOpacity: animationOpacity.export(),
              animationData: animation.export()
            });
          }, 0);
        } else {
          let animation = wx.createAnimation({
            duration: 100,
            timingFunction: "ease"
          });
          let animationOpacity = wx.createAnimation({
            duration: 500,
            timingFunction: "ease"
          });
          animation.bottom(-320).step();
          animationOpacity.opacity(0).step();
          this.setData({
            animationOpacity: animationOpacity.export(),
            animationData: animation.export()
          });
        }
        if (this.data.startValue && this.data.endValue) {
          let s = 0,
            e = 0;
          this.data.startValue.map(val => {
            if (val == 0) {
              s++;
            }
          });
          this.data.endValue.map(val => {
            if (val == 0) {
              e++;
            }
          });
          if (s == 6 || e == 6) {
            this.initPick();
            this.setData({
              startValue: this.data.startValue,
              endValue: this.data.endValue
            });
          }
        }
      }
    },
    config: Object
  },
  data: {},
  detached: function() {
    console.log("detached");
  },
  attached: function() {},
  ready: function() {
    this.readConfig();
    this.initPick();
    this.setData({
      startValue: this.data.startValue,
      endValue: this.data.endValue
    });
  },
  methods: {
    readConfig() {
      let conf = this.data.config || {};
      let data = getDate();
      let currentYear = data.getFullYear();
      let limitEndTime = data.getTime();
      let limitStartTime = data.getTime() - 1000 * 60 * 60 * 24 * 30;
      if (conf) {
        if (typeof conf.dateLimit == "number") {
          limitStartTime =
            getDate().getTime() - 1000 * 60 * 60 * 24 * conf.dateLimit;
        }
        if (conf.limitStartTime) {
          limitStartTime = getDate(conf.limitStartTime).getTime();
        }
        if (conf.limitEndTime) {
          limitEndTime = getDate(conf.limitEndTime).getTime();
        }

        this.setData({
          yearStart: conf.yearStart || currentYear,
          yearEnd: conf.yearEnd || currentYear + 10,
          endDate: conf.endDate || false,
          dateLimit: conf.dateLimit || false,
          hourColumn:
            conf.column == "hour" ||
            conf.column == "minute" ||
            conf.column == "second",
          minColumn: conf.column == "minute" || conf.column == "second",
          secColumn: conf.column == "second"
        });
      }
      let limitStartTimeArr = formatTime(limitStartTime);
      let limitEndTimeArr = formatTime(limitEndTime);

      this.setData({
        limitStartTime,
        limitStartTimeArr,
        limitEndTime,
        limitEndTimeArr
      });
    },
    onConfirm: function() {
      let startTime = getDate(this.data.startPickTime);
      let endTime = getDate(this.data.endPickTime);
      if (startTime <= endTime || !this.data.endDate) {
        this.setData({
          startTime,
          endTime
        });
        let startArr = formatTime(startTime).arr;
        let endArr = formatTime(endTime).arr;
        let format0 = function(num) {
          return num < 10 ? "0" + num : num;
        };

        let startTimeBack =
          startArr[0] +
          "-" +
          format0(startArr[1]) +
          "-" +
          format0(startArr[2]) +
          " " +
          (this.data.hourColumn ? format0(startArr[3]) : "00") +
          ":" +
          (this.data.minColumn ? format0(startArr[4]) : "00") +
          ":" +
          (this.data.secColumn ? format0(startArr[5]) : "00");

        let endTimeBack =
          endArr[0] +
          "-" +
          format0(endArr[1]) +
          "-" +
          format0(endArr[2]) +
          " " +
          (this.data.hourColumn ? format0(endArr[3]) : "00") +
          ":" +
          (this.data.minColumn ? format0(endArr[4]) : "00") +
          ":" +
          (this.data.secColumn ? format0(endArr[5]) : "00");

        let time = {
          startTime: startTimeBack,
          endTime: endTimeBack
        };
        this.triggerEvent("setPickerTime", time);
        this.triggerEvent("hidePicker", {});
      } else {
        wx.showToast({
          icon: "none",
          title: "时间不合理"
        });
      }
    },
    hideModal: function() {
      this.triggerEvent("hidePicker", {});
    },
    changeStartDateTime: function(e) {
      let val = e.detail.value;
      this.compareTime(val, "start");
    },

    changeEndDateTime: function(e) {
      let val = e.detail.value;
      this.compareTime(val, "end");
    },
    compareTime(val, type) {
      let h = val[3] ? this.data.HourList[val[3]] : "00";
      let m = val[4] ? this.data.MinuteList[val[4]] : "00";
      let s = val[5] ? this.data.SecondList[val[5]] : "00";
      let time =
        this.data.YearList[val[0]] +
        "-" +
        this.data.MonthList[val[1]] +
        "-" +
        this.data.DayList[val[2]] +
        " " +
        h +
        ":" +
        m +
        ":" +
        s;

      let start = this.data.limitStartTime;
      let end = this.data.limitEndTime;
      let timeNum = getDate(time).getTime();
      let year, month, day, hour, min, sec, limitDate;
      let tempArr = [];

      if (!this.data.dateLimit) {
        limitDate = [
          this.data.YearList[val[0]],
          this.data.MonthList[val[1]],
          this.data.DayList[val[2]],
          this.data.HourList[val[3]],
          this.data.MinuteList[val[4]],
          this.data.SecondList[val[5]]
        ];
      } else if (type == "start" && timeNum > getDate(this.data.endPickTime)) {
        limitDate = formatTime(this.data.endPickTime).arr;
      } else if (type == "end" && timeNum < getDate(this.data.startPickTime)) {
        limitDate = formatTime(this.data.startPickTime).arr;
      } else if (timeNum < start) {
        limitDate = this.data.limitStartTimeArr.arr;
      } else if (timeNum > end) {
        limitDate = this.data.limitEndTimeArr.arr;
      } else {
        limitDate = [
          this.data.YearList[val[0]],
          this.data.MonthList[val[1]],
          this.data.DayList[val[2]],
          this.data.HourList[val[3]],
          this.data.MinuteList[val[4]],
          this.data.SecondList[val[5]]
        ];
      }

      year = limitDate[0];
      month = limitDate[1];
      day = limitDate[2];
      hour = limitDate[3];
      min = limitDate[4];
      sec = limitDate[5];

      if (type == "start") {
        this.setStartDate(year, month, day, hour, min, sec);
      } else if (type == "end") {
        this.setEndDate(year, month, day, hour, min, sec);
      }
    },
    getDays: function(year, month) {
      let daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (month === 2) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
          ? 29
          : 28;
      } else {
        return daysInMonth[month - 1];
      }
    },
    initPick: function() {
      const date = getDate();
      const startDate = getDate(date.getTime() - 1000 * 60 * 60 * 24);
      const nowYear = date.getFullYear();
      const nowMonth = date.getMonth() + 1;
      const nowDay = date.getDate();
      const nowHour = date.getHours();
      const nowMinute = date.getMinutes();
      const nowSecond = date.getSeconds();

      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth() + 1;
      const startDay = startDate.getDate();
      const startHour = startDate.getHours();
      const startMinute = startDate.getMinutes();
      const startSecond = startDate.getSeconds();

      let YearList = [];
      let MonthList = [];
      let DayList = [];
      let HourList = [];
      let MinuteList = [];
      let SecondList = [];

      for (let i = this.data.yearStart; i <= this.data.yearEnd; i++) {
        YearList.push(i);
      }

      for (let i = 1; i <= 12; i++) {
        MonthList.push(i);
      }
      for (let i = 1; i <= 31; i++) {
        DayList.push(i);
      }
      for (let i = 0; i <= 23; i++) {
        if (0 <= i && i < 10) {
          i = "0" + i;
        }
        HourList.push(i);
      }
      for (let i = 0; i <= 59; i++) {
        if (0 <= i && i < 10) {
          i = "0" + i;
        }
        MinuteList.push(i);
        SecondList.push(i);
      }

      this.setData({
        YearList,
        MonthList,
        DayList,
        HourList,
        MinuteList,
        SecondList
      });

      let conf = this.data.config;
      let defaultDate = conf.defaultDate ? getDate(conf.defaultDate) : false;

      if (defaultDate) {
        this.setStartDate(
          defaultDate.getFullYear(),
          defaultDate.getMonth() + 1,
          defaultDate.getDate(),
          defaultDate.getHours(),
          defaultDate.getMinutes(),
          defaultDate.getSeconds()
        );
      } else {
        this.setStartDate(
          startYear,
          startMonth,
          startDay,
          startHour,
          startMinute,
          startSecond
        );
      }

      this.setEndDate(nowYear, nowMonth, nowDay, nowHour, nowMinute, nowSecond);
    },
    setPickerDateArr(type, year, month, day, hour, minute, second) {
      let yearIdx = 0;
      let monthIdx = 0;
      let dayIdx = 0;
      let hourIdx = 0;
      let minuteIdx = 0;
      let secondIdx = 0;

      this.data.YearList.map((v, idx) => {
        if (parseInt(v) === year) {
          yearIdx = idx;
        }
      });

      this.data.MonthList.map((v, idx) => {
        if (parseInt(v) === month) {
          monthIdx = idx;
        }
      });

      let DayList = [];
      for (let i = 1; i <= this.getDays(year, month); i++) {
        DayList.push(i);
      }

      DayList.map((v, idx) => {
        if (parseInt(v) === day) {
          dayIdx = idx;
        }
      });
      if (type == "start") {
        this.setData({ startDayList: DayList });
      } else if (type == "end") {
        this.setData({ endDayList: DayList });
      }

      this.data.HourList.map((v, idx) => {
        if (parseInt(v) === parseInt(hour)) {
          hourIdx = idx;
        }
      });

      this.data.MinuteList.map((v, idx) => {
        if (parseInt(v) === parseInt(minute)) {
          minuteIdx = idx;
        }
      });
      this.data.SecondList.map((v, idx) => {
        if (parseInt(v) === parseInt(second)) {
          secondIdx = idx;
        }
      });

      return {
        yearIdx,
        monthIdx,
        dayIdx,
        hourIdx,
        minuteIdx,
        secondIdx
      };
    },
    setStartDate: function(year, month, day, hour, minute, second) {
      let pickerDateArr = this.setPickerDateArr(
        "start",
        year,
        month,
        day,
        hour,
        minute,
        second
      );
      this.setData({
        confirmColor: this.data.config.confirmColor || "#19f",
        startYearList: this.data.YearList,
        startMonthList: this.data.MonthList,
        startHourList: this.data.HourList,
        startMinuteList: this.data.MinuteList,
        startSecondList: this.data.SecondList,
        startValue: [
          pickerDateArr.yearIdx,
          pickerDateArr.monthIdx,
          pickerDateArr.dayIdx,
          pickerDateArr.hourIdx,
          pickerDateArr.minuteIdx,
          pickerDateArr.secondIdx
        ],
        startPickTime:
          this.data.YearList[pickerDateArr.yearIdx] +
          "-" +
          this.data.MonthList[pickerDateArr.monthIdx] +
          "-" +
          this.data.DayList[pickerDateArr.dayIdx] +
          " " +
          this.data.HourList[pickerDateArr.hourIdx] +
          ":" +
          this.data.MinuteList[pickerDateArr.minuteIdx] +
          ":" +
          this.data.SecondList[pickerDateArr.secondIdx]
      });
    },
    setEndDate: function(year, month, day, hour, minute, second) {
      let pickerDateArr = this.setPickerDateArr(
        "end",
        year,
        month,
        day,
        hour,
        minute,
        second
      );

      this.setData({
        endYearList: this.data.YearList,
        endMonthList: this.data.MonthList,
        endHourList: this.data.HourList,
        endMinuteList: this.data.MinuteList,
        endSecondList: this.data.SecondList,
        endValue: [
          pickerDateArr.yearIdx,
          pickerDateArr.monthIdx,
          pickerDateArr.dayIdx,
          pickerDateArr.hourIdx,
          pickerDateArr.minuteIdx,
          pickerDateArr.secondIdx
        ],
        endPickTime:
          this.data.YearList[pickerDateArr.yearIdx] +
          "-" +
          this.data.MonthList[pickerDateArr.monthIdx] +
          "-" +
          this.data.DayList[pickerDateArr.dayIdx] +
          " " +
          this.data.HourList[pickerDateArr.hourIdx] +
          ":" +
          this.data.MinuteList[pickerDateArr.minuteIdx] +
          ":" +
          this.data.SecondList[pickerDateArr.secondIdx]
      });
    }
  }
});

function formatTime(date) {
  if (typeof date === "string" || typeof date === "number") {
    date = getDate(date);
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return {
    str:
      [year, month, day].map(formatNumber).join("-") +
      " " +
      [hour, minute, second].map(formatNumber).join(":"),
    arr: [year, month, day, hour, minute, second]
  };
}
function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : "0" + n;
}
