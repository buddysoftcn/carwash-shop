// pages/cancelPaymentOrder/cancelPaymentOrder.js
let util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showOrderView:false,
    order:{},
    datatime: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let order = getApp().globalData.param

    let datetime = util.formatDate(order.date) + ' ' + util.formatTime(order.time)
    this.setData({
      order: order,
      datetime: datetime
    })
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
  onShowCancelView:function() {
    this.setData({
      showOrderView: true
    })
  },
  onCancel:function() {
    wx.navigateTo({
      url: '../paymentOrderCancelFinished/paymentOrderCancelFinished',
    })
  },
  onClose:function() {
    this.setData({
      showOrderView:false
    })
  }
})