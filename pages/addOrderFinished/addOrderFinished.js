// pages/addOrderFinished/addOrderFinished.js
let util = require('../../utils/util.js')
let currentOrder = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: '',
    time: '',
    plateNumber: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    currentOrder = getApp().globalData.param

    this.setData({
      date: util.formatDate(currentOrder.date),
      time: util.formatTime(currentOrder.time),
      plateNumber:currentOrder.plateNumber
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

  onBack:function() {
    wx.switchTab({
      url: '../home/home',
    })
  }
})