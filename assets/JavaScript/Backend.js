var thisJSON; // 目前頁面中處理的檔案
var thisObject; // 目前點選的檔案（編輯、刪除按鈕用）
var thisIndex; // 目前點選的檔案在資料中的順序
var thisId; // 目前點選的rowId（編輯、刪除按鈕用）
var maxId = 0; // 紀錄目前最大的id值

$(function () {
  // 設定日期格式
  var dateFormat = 'yy/mm/dd',
    // 設定開始日曆
    from = $('#from')
      .datepicker({
        // 顯示小日曆icon：顯示icon、檔案位置、不要按鈕底色、hover顯示字樣
        showOn: 'button',
        buttonImage: 'assets/image/backend/calendar.gif',
        buttonImageOnly: true,
        buttonText: 'Select date',
        // 設定日期格式：年月日
        dateFormat: 'yy/mm/dd',
        // 預設顯示日期：今天
        defaultDate: 'today',
        // 更換月份的下拉選單：是
        changeMonth: true,
        // 顯示月份數量：1個月
        numberOfMonths: 1,
        // 顯示底部的按鈕（今天／關閉）：是
        showButtonPanel: true,
      })
      // 當確定開始時間，結束時間日曆上的最早日期為開始時間
      .on('change', function () {
        to.datepicker('option', 'minDate', getDate(this));
      });

  // 設定結束日曆
  to = $('#to')
    .datepicker({
      showOn: 'button',
      buttonImage: 'assets/image/backend/calendar.gif',
      buttonImageOnly: true,
      buttonText: 'Select date',
      dateFormat: 'yy/mm/dd',
      defaultDate: 'today',
      changeMonth: true,
      numberOfMonths: 1,
      showButtonPanel: true,
    })
    .on('change', function () {
      from.datepicker('option', 'maxDate', getDate(this));
    });

  // ★★不清楚這個是要做什麼（這個是範本上就有的）
  function getDate(element) {
    var date;
    try {
      date = $.datepicker.parseDate(dateFormat, element.value);
    } catch (error) {
      date = null;
    }
    return date;
  }
});

// 用ajax接外部json檔案，取得後執行renderJSON()
$.ajax({
  dataType: 'json',
  method: 'GET',
  url: 'assets/json/Backend.json',
  data: '',
  success: function (data) {
    // 把資料變成全域變數
    thisJSON = data.data;
    renderJSON(thisJSON);
    return thisJSON;
  },
});

var table;
function renderJSON(thisJSON) {
  table = $('#table_id').DataTable({
    // 取得檔案
    data: thisJSON,
    // 資料欄位區塊(columns),
    columns: [
      { data: 'rowId' },
      { data: 'chartName' },
      { data: 'isShowName' },
      { data: null },
    ],
    // 設定欄位id
    rowId: 'rowId',
    // 設定動作的按鈕
    columnDefs: [
      {
        targets: 3,
        render: function () {
          var edit_btn = `<button onclick="showEditPopUp(this)">編輯</button>`;
          var delete_btn = `<button onclick="deleteData(this)">刪除</button>`;
          return edit_btn + '<br>' + delete_btn;
        },
      },
    ],

    // 每列的class（用來設定橫條紋）
    stripeClasses: ['stripe-1', 'stripe-2'],
    // 改變顯示資料量：關閉
    lengthChange: false,
    // 搜尋欄：關閉
    searching: false,
    // 每頁資料：7筆
    lengthMenu: [7],
    // 按鈕列樣式：全部顯示
    pagingType: 'full_numbers',
    // 語言區塊(language),
    language: {
      url: 'assets/json/zh-HANT.json',
    },
  });
}

// 點擊新增時，跳出視窗
function showAddPopUp() {
  $('#popUp_title').html('新增');
  $('#editData').css('display', 'none');
  $('.popUp').css('display', 'block');
}

// 輸入新資料
function saveNewData() {
  // 下拉選單資料驗證
  if ($('#popUpChart').val() == null) {
    $('#popUpChartLabel').addClass('required');
  } else {
    $('#popUpChartLabel').removeClass('required');
  }
  // Radio資料驗證
  if ($('input[name="show"]:checked').val() == undefined) {
    $('#popUpRadioLabel').addClass('required');
  } else {
    $('#popUpRadioLabel').removeClass('required');
  }
  // 若都有填資料，執行以下動作
  if (
    $('#popUpChart').val() !== null &&
    $('input[name="show"]:checked').val() !== undefined
  ) {
    // 避免id重複，找出資料中最大值的id
    for (i = 0; i < thisJSON.length; i++) {
      if (maxId < parseInt(thisJSON[i].rowId)) {
        maxId = parseInt(thisJSON[i].rowId);
      }
    }
    var newData = {
      rowId: maxId + 1,
      dataId: maxId + 1,
      chartId: $('#popUpChart option:selected').val(),
      chartName: $('#popUpChart option:selected').text(),
      isShow: $('input[name="show"]:checked').val(),
      isShowName: $('input[name="show"]:checked').attr('isShowName'),
    };
    table.row.add(newData).draw();
    // 紀錄最大值id
    maxId++;
    // 將資料 unshift 進原本的JSON裡面
    thisJSON.unshift(newData);
    // 關掉視窗
    closePopUp();
  }
}

// 點擊取消時，關掉視窗
function closePopUp() {
  $('.popUp').css('display', 'none');
  // 關掉資料驗證的醒目文字
  $('#popUpChartLabel').removeClass('required');
  $('#popUpRadioLabel').removeClass('required');
  // 清空表單資料
  $('#popUpChart').val(null);
  $('input[name="show"]').prop('checked', false);
  // 顯示兩個存檔紐（避免再開的時候不見）
  $('#saveNewData').css('display', 'block');
  $('#editData').css('display', 'block');
}

// 用鍵盤操控視窗按鈕
$(window).keydown(function (e) {
  if (e.code == 'Escape') {
    closePopUp();
  }
  if (e.code == 'Enter') {
    if ($('#popUp_title').prop('innerHTML') == '新增') {
      saveNewData();
    } else if ($('#popUp_title').prop('innerHTML') == '編輯') {
      editData();
    }
  }
});

// 點擊編輯時，跳出視窗
function showEditPopUp(e) {
  $('#popUp_title').html('編輯');
  $('#saveNewData').css('display', 'none');
  $('.popUp').css('display', 'block');
  // 找出原本的資料
  thisId = $(e).parent().parent().attr('id');
  thisObject = thisJSON.find((thisJSON) => thisJSON.rowId === thisId);
  // 顯示原本的資料
  $('#popUpChart').val(thisObject.chartId);
  if (thisObject.isShow == 'Y') {
    $('#RadioYes').prop('checked', true);
  } else if (thisObject.isShow == 'N') {
    $('#RadioNo').prop('checked', true);
  }
}

// 編輯資料
function editData() {
  // 覆寫新資料
  var newData = {
    rowId: thisObject.rowId,
    dataId: thisObject.dataId,
    chartId: $('#popUpChart option:selected').val(),
    chartName: $('#popUpChart option:selected').text(),
    isShow: $('input[name="show"]:checked').val(),
    isShowName: $('input[name="show"]:checked').attr('isShowName'),
  };
  table
    .row($('tr[id=' + thisId + ']'))
    .data(newData)
    .draw(false);
  // 更換新資料
  thisIndex = thisJSON.findIndex((thisJSON) => thisJSON.rowId === thisId);
  thisJSON.splice(thisIndex, 1, newData);
  // 關掉視窗
  closePopUp();
}

// 點擊刪除時，出現確認視窗
function deleteData(e) {
  // 取得該筆資料的rowId
  thisId = $(e).parent().parent().attr('id');
  // 如果確定刪除
  if (confirm('確定刪除該資料列') == true) {
    table
      .row($('tr[id=' + thisId + ']'))
      .remove()
      .draw(false);
    // 刪除該筆資料
    thisIndex = thisJSON.findIndex((thisJSON) => thisJSON.rowId === thisId);
    thisJSON.splice(thisIndex, 1);
  }
}
