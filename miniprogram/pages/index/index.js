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
    /*轮播图参数*/
    background:[
        "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83eo2Pc3pVuWXumNlgMFib5TX3FARXlFXSvcvDPgav2BIfVq5qW6rW9QN430OYSKTXRgpagSLntNp5kw/132",
        "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83er6OV33jHia3UyAKxQGBexgrlic3v0Q2icmKoc7oLlfNZ7OwodPYhWklfgEj8pKxvCNdkM4PHVdsyOww/132"
    ],
    indicatorDots:true,//是否显示指示点
    vertical:false,//滑动方向是否为纵向
    autoplay:true,//是否自动播放
    interval:2000,//自动播放间隔时长
    duration:500,//幻灯片切换时长
    indicatorColor:"#d7f0db",//指示点颜色
    indicatorActiveColor:"#39b54a",//当前指示点的颜色
    /*轮播图结束*/
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    await this.getPostsList('', 'createTime')
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: async function () {
    let that = this;
    let page = 1
    that.setData({
      page: page,
      posts: [],
      filter: "",
      nomore: false,
      nodata: false,
      defaultSearchValue: ""
    })
    await this.getPostsList("")
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function () {
    let whereItem=this.data.whereItem
    let filter = this.data.filter
    await this.getPostsList(whereItem[0],whereItem[1],whereItem[2])
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

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
 * tab切换
 * @param {} e 
 */
  tabSelect: async function (e) {
    let that = this;
    console.log(e);
    let tabCur = e.currentTarget.dataset.id
    switch (tabCur) {
      case 1: {
        that.setData({
          tabCur: e.currentTarget.dataset.id,
          scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
          nomore: false,
          nodata: false,
          showHot: false,
          showLabels: false,
          defaultSearchValue: "",
          posts: [],
          page: 1,
          whereItem:['', 'createTime','']
        })

        await that.getPostsList("", 'createTime')
        break
      }
      case 2: {
        that.setData({
          posts: [],
          tabCur: e.currentTarget.dataset.id,
          scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
          showHot: true,
          showLabels: false,
          defaultSearchValue: "",
          page: 1,
          nomore: false,
          nodata: false,
          whereItem:['', 'totalVisits','']
        })
        await that.getPostsList("", "totalVisits")
        break
      }
      case 3: {
        that.setData({
          tabCur: e.currentTarget.dataset.id,
          scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
          showHot: false,
          showLabels: true,
        })

        let task = that.getPostsList("", 'createTime')
        let labelList = await api.getLabelList()
        that.setData({
          labelList: labelList.result.data
        })
        await task

        break
      }
    }
  },

  /**
   * 热门按钮切换
   * @param {*} e 
   */
  hotSelect: async function (e) {
    let that = this
    let hotCur = e.currentTarget.dataset.id
    let orderBy = "createTime"
    switch (hotCur) {
      //浏览最多
      case 0: {
        orderBy = "totalVisits"
        break
      }
      //评论最多
      case 1: {
        orderBy = "totalComments"
        break
      }
      //点赞最多
      case 2: {
        orderBy = "totalZans"
        break
      }
      //收藏最多
      case 3: {
        orderBy = "totalCollection"
        break
      }
    }
    that.setData({
      posts: [],
      hotCur: hotCur,
      defaultSearchValue: "",
      page: 1,
      nomore: false,
      nodata: false,
      whereItem:['', orderBy,'']
    })
    await that.getPostsList("", orderBy)
  },

  /**
   * 标签按钮切换
   * @param {*} e 
   */
  labelSelect: async function (e) {
    let that = this
    let labelCur = e.currentTarget.dataset.id

    that.setData({
      posts: [],
      labelCur: labelCur,
      defaultSearchValue: "",
      page: 1,
      nomore: false,
      nodata: false,
      whereItem:['', 'createTime',labelCur == "全部" ? "" : labelCur]
    })

    await that.getPostsList("", "createTime", labelCur == "全部" ? "" : labelCur)
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
  }
})