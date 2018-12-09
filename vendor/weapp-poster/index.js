const main = {
    drawBlock({ overflow = false, texts, width = 0, height, x, y, paddingLeft = 0, paddingRight = 0, borderWidth, backgroundColor, borderColor, borderRadius = 0, opacity = 1 }) {
        let blockWidth = 0;
        let textX = 0;
        let textY = 0;
        if (typeof texts !== 'undefined') {
            const textWidth = this._getTextWidth(typeof texts.text === 'string' ? texts : texts.text);
            blockWidth = textWidth > width && !overflow ? textWidth : width;
            blockWidth += paddingLeft + paddingLeft;

            const { textAlign = 'left', text: textCon } = texts;
            textY = height / 2 + y;
            if (textAlign === 'left') {
                textX = x + paddingLeft;
            } else if (textAlign === 'center') {
                textX = blockWidth / 2 + x;
            } else {
                textX = x + blockWidth - paddingRight;
            }
        } else {
            blockWidth = width;
        }

        if (backgroundColor) {
            this.ctx.save();
            this.ctx.setGlobalAlpha(opacity);
            this.ctx.setFillStyle(backgroundColor);
            if (borderRadius > 0) {
                this._drawRadiusRect(x, y, blockWidth, height, borderRadius);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(this.toPx(x), this.toPx(y), this.toPx(blockWidth), this.toPx(height));
            }
            this.ctx.restore();
        }
        if (borderWidth) {
            this.ctx.save();
            this.ctx.setGlobalAlpha(opacity);
            this.ctx.setStrokeStyle(borderColor);
            this.ctx.setLineWidth(this.toPx(borderWidth));
            if (borderRadius > 0) {

                this._drawRadiusRect(x, y, blockWidth, height, borderRadius);
                this.ctx.stroke();
            } else {
                this.ctx.strokeRect(this.toPx(x), this.toPx(y), this.toPx(blockWidth), this.toPx(height));
            }
            this.ctx.restore();
        }

        if (texts) {
            this.drawText(Object.assign(texts, { x: textX, y: textY, overflow }))
        }
    },
    drawText(params) {
        const { x, y, fontSize, color, baseLine, textAlign, text, opacity = 1, width, lineNum, lineHeight, overflow } = params;
        if (Object.prototype.toString.call(text) === '[object Array]') {
            let preText = { x, y, baseLine };
            text.forEach(item => {
                preText.x += item.marginLeft || 0;
                const textWidth = this._drawSingleText(Object.assign(item, {
                    overflow,
                    ...preText,
                }));
                preText.x += textWidth + (item.marginRight || 0);
            })
        } else {
            this._drawSingleText(params);
        }
    },
    drawImage(data) {
        const { imgPath, x, y, w, h, sx, sy, sw, sh, borderRadius = 0, borderWidth = 0, borderColor } = data;
        this.ctx.save();
        if (borderRadius > 0) {
            this._drawRadiusRect(x, y, w, h, borderRadius);
            this.ctx.clip();
            this.ctx.drawImage(imgPath, this.toPx(sx), this.toPx(sy), this.toPx(sw), this.toPx(sh), this.toPx(x), this.toPx(y), this.toPx(w), this.toPx(h));
            if (borderWidth > 0) {
                this.ctx.setStrokeStyle(borderColor);
                this.ctx.setLineWidth(this.toPx(borderWidth));
                this.ctx.stroke();
            }
        } else {
            this.ctx.drawImage(imgPath, this.toPx(sx), this.toPx(sy), this.toPx(sw), this.toPx(sh), this.toPx(x), this.toPx(y), this.toPx(w), this.toPx(h));
        }
        this.ctx.restore();
    },
    drawLine({ startX, startY, endX, endY, color, width }) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.setStrokeStyle(color);
        this.ctx.setLineWidth(this.toPx(width));
        this.ctx.moveTo(this.toPx(startX), this.toPx(startY));
        this.ctx.lineTo(this.toPx(endX), this.toPx(endY));
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    },
    downloadResourceCanvas(images = []) {
        const drawList = [];
        this.drawArr = [];
        images.forEach((image, index) => drawList.push(this._downloadImageAndInfo(image, index)));
        return Promise.all(drawList);
    },
    initCanvas(w, h, debug) {
        return new Promise((resolve) => {
            this.setData({
                pxWidth: this.toPx(w),
                pxHeight: this.toPx(h),
                debug,
            }, resolve);
        });
    }
}
const handle = {
    _drawRadiusRect(x, y, w, h, r) {
        const br = r / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.toPx(x + br), this.toPx(y));
        this.ctx.lineTo(this.toPx(x + w - br), this.toPx(y));
        this.ctx.arc(this.toPx(x + w - br), this.toPx(y + br), this.toPx(br), 2 * Math.PI * (3 / 4), 2 * Math.PI * (4 / 4))
        this.ctx.lineTo(this.toPx(x + w), this.toPx(y + h - br));
        this.ctx.arc(this.toPx(x + w - br), this.toPx(y + h - br), this.toPx(br), 0, 2 * Math.PI * (1 / 4))
        this.ctx.lineTo(this.toPx(x + br), this.toPx(y + h));
        this.ctx.arc(this.toPx(x + br), this.toPx(y + h - br), this.toPx(br), 2 * Math.PI * (1 / 4), 2 * Math.PI * (2 / 4))
        this.ctx.lineTo(this.toPx(x), this.toPx(y + br));
        this.ctx.arc(this.toPx(x + br), this.toPx(y + br), this.toPx(br), 2 * Math.PI * (2 / 4), 2 * Math.PI * (3 / 4))
    },
    _getTextWidth(text) {
        let texts = [];
        if (Object.prototype.toString.call(text) === '[object Object]') {
            texts.push(text);
        } else {
            texts = text;
        }
        let width = 0;
        texts.forEach(({ fontSize, text, marginLeft = 0, marginRight = 0 }) => {
            this.ctx.setFontSize(this.toPx(fontSize));
            width += this.ctx.measureText(text).width + marginLeft + marginRight;
        })

        return this.toRpx(width);
    },
    _drawSingleText({ x, y, fontSize, color, baseLine, textAlign = 'left', text, opacity = 1, textDecoration = 'none',
        width, lineNum = 1, lineHeight = 0, overflow }) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.setGlobalAlpha(opacity);
        this.ctx.setFontSize(this.toPx(fontSize));
        this.ctx.setFillStyle(color);
        this.ctx.setTextBaseline(baseLine);
        this.ctx.setTextAlign(textAlign);
        let textWidth = this.toRpx(this.ctx.measureText(text).width);
        const textArr = [];
        console.log(1, overflow, textWidth > width)
        if (textWidth > width) {
            const unitTextWidth = +(textWidth / text.length).toFixed(2);
            const unitLineNum = width / unitTextWidth;
            for (let i = 0; i <= text.length; i += unitLineNum) {
                const resText = text.slice(i, i + unitLineNum);
                resText !== '' && textArr.push(resText);
                if (overflow || textArr.length === lineNum) {
                    break;
                }
            }
            if (!overflow && textArr.length * unitLineNum < text.length) {
                const moreTextWidth = this.ctx.measureText('...').width;
                const moreTextNum = Math.ceil(moreTextWidth / unitTextWidth);
                const reg = new RegExp(`.{${moreTextNum}}$`);
                textArr[textArr.length - 1] = textArr[textArr.length - 1].replace(reg, '...');
            }
            textWidth = width;
        } else {
            textArr.push(text);
        }

        textArr.forEach((item, index) => {
            this.ctx.fillText(item, this.toPx(x), this.toPx(y + (lineHeight || fontSize) * index));
        })

        this.ctx.restore();


        if (textDecoration !== 'none') {
            let lineY = y;
            if (textDecoration === 'line-through') {

                lineY = y;
            }
            this.ctx.save();
            this.ctx.moveTo(this.toPx(x), this.toPx(lineY));
            this.ctx.lineTo(this.toPx(x) + this.toPx(textWidth), this.toPx(lineY));
            this.ctx.setStrokeStyle(color);
            this.ctx.stroke();
            this.ctx.restore();
        }

        return textWidth;
    },
}
const helper = {
    _downloadImageAndInfo(image, index) {
        return new Promise((resolve, reject) => {
            const { x, y, url, zIndex } = image;
            const imageUrl = url;

            this._downImage(imageUrl, index)
                .then(imgPath => this._getImageInfo(imgPath, index))
                .then(({ imgPath, imgInfo }) => {

                    let sx;
                    let sy;
                    const borderRadius = image.borderRadius || 0;
                    const setWidth = image.width;
                    const setHeight = image.height;
                    const width = this.toRpx(imgInfo.width);
                    const height = this.toRpx(imgInfo.height);
                    if (width / height <= setWidth / setHeight) {
                        sx = 0;
                        sy = (height - ((width / setWidth) * setHeight)) / 2;
                    } else {
                        sy = 0;
                        sx = (width - ((height / setHeight) * setWidth)) / 2;
                    }
                    this.drawArr.push({
                        type: 'image',
                        borderRadius,
                        borderWidth: image.borderWidth,
                        borderColor: image.borderColor,
                        zIndex: typeof zIndex !== 'undefined' ? zIndex : index,
                        imgPath,
                        sx,
                        sy,
                        sw: (width - (sx * 2)),
                        sh: (height - (sy * 2)),
                        x,
                        y,
                        w: setWidth,
                        h: setHeight,
                    });
                    resolve();
                })
                .catch(err => reject(err));
        });
    },
    _downImage(imageUrl) {
        return new Promise((resolve, reject) => {
            if (/^http/.test(imageUrl) && !new RegExp(wx.env.USER_DATA_PATH).test(imageUrl)) {
                wx.downloadFile({
                    url: this._mapHttpToHttps(imageUrl),
                    success: (res) => {
                        if (res.statusCode === 200) {
                            resolve(res.tempFilePath);
                        } else {
                            reject(res.errMsg);
                        }
                    },
                    fail(err) {
                        reject(err);
                    },
                });
            } else {

                resolve(imageUrl);
            }
        });
    },
    _getImageInfo(imgPath, index) {
        return new Promise((resolve, reject) => {
            wx.getImageInfo({
                src: imgPath,
                success(res) {
                    resolve({ imgPath, imgInfo: res, index });
                },
                fail(err) {
                    reject(err);
                },
            });
        });
    },
    toPx(rpx) {
        return rpx * this.factor;
    },
    toRpx(px) {
        return px / this.factor;
    },
    _mapHttpToHttps(rawUrl) {
        if (rawUrl.indexOf(':') < 0) {
            return rawUrl;
        }
        const urlComponent = rawUrl.split(':');
        if (urlComponent.length === 2) {
            if (urlComponent[0] === 'http') {
                urlComponent[0] = 'https';
                return `${urlComponent[0]}:${urlComponent[1]}`;
            }
        }
        return rawUrl;
    },
}
let $poster
Component({
    properties: {
        config: {
            type: Object,
            value: {},
        },
        preload: {
            type: Boolean,
            value: false,
        },
        hideLoading: {
            type: Boolean,
            value: false,
        }
    },
    created() {
        const sysInfo = wx.getSystemInfoSync();
        const screenWidth = sysInfo.screenWidth;
        this.factor = screenWidth / 750;
    },
    ready() {
        $poster = this.getPosterEl()
        if (this.data.preload) {
            this.downloadStatus = 'doing';
            $poster.downloadResource(this.data.config.images).then(() => {
                this.downloadStatus = 'success';
                this.trigger('downloadSuccess');
            }).catch((e) => {
                this.downloadStatus = 'fail';
                this.trigger('downloadFail', e);
            });
        }
    },
    methods: Object.assign({
        trigger(event, data) {
            if (this.listener && typeof this.listener[event] === 'function') {
                this.listener[event](data);
            }
        },
        once(event, fun) {
            if (typeof this.listener === 'undefined') {
                this.listener = {};
            }
            this.listener[event] = fun;
        },
        downloadResource() {
            return new Promise((resolve, reject) => {
                if (this.downloadStatus && this.downloadStatus !== 'fail') {
                    if (this.downloadStatus === 'success') {
                        resolve();
                    } else {
                        this.once('downloadSuccess', () => resolve());
                        this.once('downloadFail', (e) => reject(e));
                    }
                } else {
                    this.downloadResourceCanvas(this.data.config.images)
                        .then(() => {
                            this.downloadStatus = 'success';
                            resolve();
                        })
                        .catch((e) => reject(e));
                }
            })
        },
        getPosterEl() {
            const query = wx.createSelectorQuery().in(this)
            return query.select('#weapp-poster')
        },
        onCreate() {
            !this.data.hideLoading && wx.showLoading({ mask: true, title: '生成中' });
            return this.downloadResource().then(() => {
                !this.data.hideLoading && wx.hideLoading();
                this.create(this.data.config);
            })
                .catch((err) => {
                    !this.data.hideLoading && wx.hideLoading();
                    wx.showToast({ icon: 'none', title: err.errMsg || '生成失败' });
                    console.error(err);
                    this.triggerEvent('fail', err);
                })
        },
        onCreateSuccess(e) {
            const { detail } = e;
            this.triggerEvent('success', detail);
        },
        onCreateFail(err) {
            console.error(err);
            this.triggerEvent('fail', err);
        },
        create(config) {
            this.ctx = wx.createCanvasContext('canvasid', this);

            this.initCanvas(config.width, config.height, config.debug)
                .then(() => {

                    if (config.backgroundColor) {
                        this.ctx.save();
                        this.ctx.setFillStyle(config.backgroundColor);
                        this.ctx.fillRect(0, 0, this.toPx(config.width), this.toPx(config.height));
                        this.ctx.restore();
                    }
                    const { texts = [], images = [], blocks = [], lines = [] } = config;
                    const queue = this.drawArr
                        .concat(texts.map((item) => {
                            item.type = 'text';
                            item.zIndex = item.zIndex || 0;
                            return item;
                        }))
                        .concat(blocks.map((item) => {
                            item.type = 'block';
                            item.zIndex = item.zIndex || 0;
                            return item;
                        }))
                        .concat(lines.map((item) => {
                            item.type = 'line';
                            item.zIndex = item.zIndex || 0;
                            return item;
                        }));

                    queue.sort((a, b) => a.zIndex - b.zIndex);

                    queue.forEach((item) => {
                        if (item.type === 'image') {
                            this.drawImage(item)
                        } else if (item.type === 'text') {
                            this.drawText(item)
                        } else if (item.type === 'block') {
                            this.drawBlock(item)
                        } else if (item.type === 'line') {
                            this.drawLine(item)
                        }
                    });

                    const res = wx.getSystemInfoSync();
                    const platform = res.platform;
                    let time = 0;
                    if (platform === 'android') {

                        time = 300;
                    }
                    this.ctx.draw(false, () => {
                        setTimeout(() => {
                            wx.canvasToTempFilePath({
                                canvasId: 'canvasid',
                                success: (res) => {
                                    this.triggerEvent('success', res.tempFilePath);
                                },
                                fail: (err) => {
                                    this.triggerEvent('fail', err);
                                },
                            }, this);
                        }, time);
                    });
                })
                .catch((err) => {
                    wx.showToast({ icon: 'none', title: err.errMsg || '生成失败' });
                    console.error(err);
                });
        },
    }, main, handle, helper),
})