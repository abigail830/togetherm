const Poster = (options = {}) => {
    options = {
        selector: '#weapp-poster',
        ...options,
    };

    const pages = getCurrentPages();
    const ctx = pages[pages.length - 1];

    const poster = ctx.selectComponent(options.selector);
    delete options.selector;

    return poster;
};

Poster.create = () => {
    const poster = Poster();
    if (!poster) {
        console.error('没有找到id为"weapp-poster"的组件');
    } else {
        return Poster().onCreate();
    }
}
export default Poster;

module.exports = Poster;