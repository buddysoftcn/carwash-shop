// pages/addMoreOrderFinished/addMoreOrderFinished.js
let util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order:{},
    dateUI:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let order = getApp().globalData.param
    let dateUI = util.formatDate(order.date)

    this.setData({
      order:order,
      dateUI:dateUI
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

  onBack:function() {
    wx.switchTab({
      url: '../home/home',
    })
  }
})