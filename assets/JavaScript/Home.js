const { createApp } = Vue; // 創造vue
var thisData; // 目前頁面中ajax取得的檔案

// 用ajax接外部json檔案，取得後執行renderVue()
$.ajax({
  dataType: 'json',
  method: 'GET',
  url: 'assets/json/main.json',
  success: function (data) {
    thisData = data;
    renderVue();
  },
});

function renderVue() {
  createApp({
    data() {
      return {
        thisData: thisData,
      };
    },
  }).mount('#app');
}

// 切換標籤時，所有標籤與表格先隱藏（去掉active），再為被點擊的標籤加上active
function labelActive(e) {
  $('.label, .main_content_text').removeClass('active');
  $(e).addClass('active');
  $('.main_content_text[id=' + e.id + ']').addClass('active');
}
