var thisJSON; // 目前頁面中 ajax 取得的檔案
const { createApp } = Vue; // 創造 Vue

// 用 getJSON 接外部 json 檔案，取得後執行 Vue
$.getJSON('assets/json/main.json', function (data) {
  thisJSON = data;
  renderVue();
});

function renderVue() {
  createApp({
    data() {
      return {
        thisJSON: thisJSON,
      };
    },
  }).mount('#app');
}

// 切換標籤時，所有標籤與表格先隱藏（去掉active），再為被點擊的標籤加上 active
function labelActive(e) {
  $('.label, .main_content_text').removeClass('active');
  $(e).addClass('active');
  $('.main_content_text[id=' + e.id + ']').addClass('active');
}
