// pages/home/home.js
let util = require('../../utils/util.js')
let shopModel = require('../../model/shop.js')
let request = require('../../operation/operation.js')
let carWash = require('../../utils/carWash.js')

let worktimesMap = null // 所有工作时间放入字典中
let worktimes = null    // 按小时将工作时间进行分组  
let currentWorkTime = null // 当前要处理的工作时间
let currentDate = null
let shop = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    date:'',  // 时间导航日期
    week:'',  // 时间导航星期
    showHelpOrderView:false,
    showOrderView:false,
    showPaymentView:false,
    showWYBtn:true, // 显示违约按钮
    popViewMessage:'',  // 弹出视图动态显示的信息
    
    worktimes:[],
    worktimesCreatedCount:0,
    worktimesFinishedCount:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
    wx.setNavigationBarTitle({
      title: getApp().buddysoft.name
    })

    shop = shopModel.getShopInfo()
    currentDate = util.today()
    this.initDate(currentDate)
    this.initWorktimeList()

    getApp().notificationCenter.register(carWash.UPDATE_WORKTIMES_MESSAGE, this, "initWorktimeList")
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    getApp().notificationCenter.remove(carWash.UPDATE_WORKTIMES_MESSAGE, this)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onCell:function(event) {    
    currentWorkTime = event.currentTarget.dataset.worktime

    if (null == currentWorkTime.order) {  // 显示帮助预约视图
      this.setData({
        popViewMessage: currentWorkTime.time,
        showHelpOrderView: true
      })
    }else {
      if ('finished' == currentWorkTime.order.state) {
        getApp().globalData.param = currentWorkTime.order
        
        wx.navigateTo({
          url: '../cancelPaymentOrder/cancelPaymentOrder',
        })
      }else {
        let showWYBtn = true
        if ('clerk' == currentWorkTime.order.createdBy) {
          showWYBtn = false
        }
        this.setData({  // 显示洗车结账、取消预约、车主违约视图
          popViewMessage: currentWorkTime.order.plateNumber,
          showPaymentView: true,
          showWYBtn: showWYBtn
        })
      }
      
    }
    
  },

  /**
   * 洗车结账
   */
  onPayment:function() {    
    getApp().globalData.param = currentWorkTime.order

    this.setData({
      showPaymentView:false
    })
    wx.navigateTo({
      url: '../paymentOrder/paymentOrder',
    })
  },

  /**
   * 帮助预约
   */
  onOrder: function () {
    getApp().globalData.param = currentWorkTime

    this.setData({
      showHelpOrderView: false
    })

    wx.navigateTo({
      url: '../addOrder/addOrder',
    })
  },

  /**
   * 洗车补录
   */
  onAddMoreOrder:function() {
    wx.navigateTo({
      url: '../addMoreOrder/addMoreOrder',
    })
  },

  /**
   * 洗车订单取消操作
   */
  onCancelOrder:function() {
    let that = this

    this.setData({
      showPaymentView:false
    })

    
    wx.showModal({
      title: '取消预约',
      content: '取消后，车主可以预约此时刻，确定取消吗？',
      success(res) {
        if (res.confirm) {
          request.postRequest('/orders/cancel/' + currentWorkTime.order.sid,null,true)
          .then(data => {
            currentWorkTime.order.state = 'canceled'
            that.renderWorkTimeList(null)
          }).catch(e => {

          })
        } 
      }
    })

  },

  onOrderLater: function () {
    this.setData({
      showHelpOrderView: false
    })
  },
  onUnOrder:function() {
    this.setData({
      showOrderView: false
    })
  },
  onUnOrderLater:function() {
    this.setData({
      showOrderView:false
    })
  },
  onClose:function() {
    this.setData({
      showHelpOrderView: false,
      showOrderView: false,
      showPaymentView: false
    })
  },

  /**
   * 日期向前事件
   */
  onForwardDay:function() {
    currentDate = util.subtractOneDay(currentDate)    
    this.initDate(currentDate)
    this.initWorktimeList()
  },

  onNextDay:function() {
    currentDate = util.addOneDay(currentDate)
    this.initDate(currentDate)
    this.initWorktimeList()
  },

  initDate:function(date) {
    this.setData({
      date:util.formatDate(date),
      week:util.week(date)
    })
  },

  initWorktimeList:function() {
    this.initWorktimesMap()
    this.initWorktimes()    
    this.getOrders()    
  },

  initWorktimesMap:function() {    
    console.log(shop)    

    if (shop) {      
      worktimesMap = new Map()

      let workTimeBegin = util.makeDate(currentDate + ' ' + shop.shopSetting.workTimeBegin)
      const workTimeEnd = util.makeDate(currentDate + ' ' + shop.shopSetting.workTimeEnd)
      const washMinutes = shop.shopSetting.washMinutes      
      const lunchTimeBegin = util.makeDate(currentDate + ' ' + shop.shopSetting.lunchTimeBegin)
      const lunchTimeEnd = util.makeDate(currentDate + ' ' + shop.shopSetting.lunchTimeEnd)
      let worktime = null

      // 计算上午工作时间
      while (workTimeBegin < lunchTimeBegin && parseInt(lunchTimeBegin - workTimeBegin)/1000/60 >= washMinutes) { 
        worktime = this.initWorktime(workTimeBegin)
        worktimesMap.set(worktime.datetime,worktime)                          
        workTimeBegin = this.makeNextWorktime(workTimeBegin, washMinutes)             
      }

      workTimeBegin = lunchTimeEnd 

      //计算下午工作时间
      while (workTimeBegin < workTimeEnd && parseInt(workTimeEnd - workTimeBegin)/1000/60 >= washMinutes) {
        worktime = this.initWorktime(workTimeBegin)
        worktimesMap.set(worktime.datetime, worktime) 
        workTimeBegin = this.makeNextWorktime(workTimeBegin, washMinutes)        
      }      
    }
  },

  initWorktime:function(datetime) {
    let worktime = {}
    worktime.datetime = util.formatDateTime(datetime)
    worktime.hour = datetime.getHours()
    worktime.date = [datetime.getFullYear(), datetime.getMonth() + 1, datetime.getDate()].map(util.formatNumber).join('-')
    worktime.time = [datetime.getHours(), datetime.getMinutes()].map(util.formatNumber).join(':')
    worktime.order = null

    return worktime
  },

  initWorktimes:function() {
    let worktimesGroupMap = new Map(),index = -1
    worktimes = []

    if (worktimesMap) {
      let worktimeGroup = null,tmpWorktimes = null
      
      for (let worktime of worktimesMap) {    
        worktimeGroup = worktimesGroupMap.get(worktime[1].hour)
        if (worktimeGroup) {                            
          worktimes[index].worktimes.push(worktime[1])
        }else {                   
          tmpWorktimes = []
          tmpWorktimes.push(worktime[1])
          worktimes.push({ 'hour': worktime[1].hour, 'worktimes': tmpWorktimes})
          worktimesGroupMap.set(worktime[1].hour, tmpWorktimes)

          index++
        }
      }
    }
  },

  renderWorkTimeList:function(orders) {
    if (orders) {
      let worktime = null, worktimesCreatedCount = 0, worktimesFinishedCount = 0

      for (let index = 0, size = orders.length; index < size; index++) {
        worktime = worktimesMap.get(orders[index].date + ' ' + orders[index].time)
        if (worktime) {
          if ('canceled' != orders[index].state) {
            worktime.order = orders[index]
          }          
        }

        if ('created' == orders[index].state) {
          worktimesCreatedCount++
        }

        if ('finished' == orders[index].state) {
          worktimesFinishedCount++
        }
      }

      this.setData({
        worktimesCreatedCount: worktimesCreatedCount,
        worktimesFinishedCount: worktimesFinishedCount
      })
    }
    
    this.setData({
      worktimes: worktimes      
    })
  },

  getOrders:function() {
    wx.showLoading({
      title: '请稍候',
      mask:true
    })

    let that = this
    request.getRequest('/orders?type=0&date=' + currentDate,null,true)
    .then(data => {
      wx.hideLoading()
      that.renderWorkTimeList(data.items)
    }).catch(e => {
      wx.hideLoading()
    })
  },

  makeNextWorktime:function(datetime,washMinutes) {    
    datetime = datetime.setMinutes(datetime.getMinutes() + washMinutes) // 计算向后的时间
    datetime = new Date(datetime)
    return datetime
  }
})