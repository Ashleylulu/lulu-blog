
const api = require('../../utils/api.js');
const regeneratorRuntime = require('../../utils/runtime.js');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        posts: [],
        page: 1,
        filter: "",
        nodata: false,
        nomore: false,
        defaultSearchValue: "",
        navItems: [{ name: '最新', index: 1 }, { name: '热门', index: 2 }, { name: '标签', index: 3 }],
        tabCur: 1,
        scrollLeft: 0,
        showHot: false,
        showLabels: false,
        hotItems: ["浏览最多", "评论最多", "点赞最多", "收藏最多"],
        hotCur: 0,
        labelList: [],
        labelCur: "全部",
        whereItem:['', 'createTime',''],//下拉查询条件
        isFocus:true
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        let whereItem=this.data.whereItem;
        if (whereItem[0] != '') {
            await this.getPostsList(whereItem[0],whereItem[1],whereItem[2])
        }
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: async function () {
        let whereItem=this.data.whereItem;
        if (whereItem[0] != '') {
            await this.getPostsList(whereItem[0],whereItem[1],whereItem[2])
        }
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: async function () {
        let whereItem=this.data.whereItem
        let filter = this.data.filter
        if (filter != '') {
            await this.getPostsList(whereItem[0],whereItem[1],whereItem[2])
        }
    },

    /**
     * 搜索功能
     * @param {} e
     */
    bindconfirm: async function (e) {
        let that = this;
        console.log('e.detail.value', e.detail.value)
        let page = 1
        that.setData({
            page: page,
            posts: [],
            filter: e.detail.value,
            nomore: false,
            nodata: false,
            whereItem:[e.detail.value, 'createTime','']
        })
        await this.getPostsList(e.detail.value, 'createTime')
    },

    /**
     * 获取文章列表
     */
    getPostsList: async function (filter, orderBy, label) {
        wx.showLoading({
            title: '加载中...',
        })
        let that = this
        let page = that.data.page
        if (that.data.nomore) {
            wx.hideLoading()
            return
        }
        let result = await api.getPostsList(page, filter, 1, orderBy, label)
        if (result.data.length === 0) {
            that.setData({
                nomore: true
            })
            if (page === 1) {
                that.setData({
                    nodata: true
                })
            }
        }
        else {
            that.setData({
                page: page + 1,
                posts: that.data.posts.concat(result.data),
            })
            console.log(that.data.posts)
        }
        wx.hideLoading()
    },
    /**
     * 点击文章明细
     */
    bindPostDetail: function (e) {
        let blogId = e.currentTarget.id;
        wx.navigateTo({
            url: '../detail/detail?id=' + blogId
        })
    },
})