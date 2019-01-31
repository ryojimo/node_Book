/**
 * @fileoverview アプリケーション UI
 * @author       Ryoji Morita
 * @version      0.0.1
*/
//const SV_IP   = 'book.rp.lfx.sony.co.jp';   // node.js server の IP アドレス
//const SV_IP   = '43.2.100.159';             // node.js server の IP アドレス
const SV_IP   = '192.168.91.112';            // node.js server の IP アドレス
const SV_PORT = 4002;                       // node.js server の port 番号

let server = io.connect('http://' + SV_IP + ':' + SV_PORT);


//-----------------------------------------------------------------------------
//-------------------------------------
// ブラウザオブジェクトから受け取るイベント
window.onload = function() {
  console.log("[app.js] window.onloaded");

  console.log("[app.js] server.emit(" + 'C_to_S_INIT' + ")");
  server.emit('C_to_S_INIT');
};


window.onunload = function() {
  console.log("[app.js] window.onunloaded");
};


//-----------------------------------------------------------------------------
// サーバから受け取るイベント
server.on('connect', function() {               // 接続時
  console.log("[app.js] " + 'connected');
});


server.on('disconnect', function(client) {      // 切断時
  console.log("[app.js] " + 'disconnected');
});


server.on('S_to_C_DATA', function(data) {
  console.log("[app.js] " + 'S_to_C_DATA');
  console.log("[app.js] data = " + data.value);
//  window.alert('コマンドを送信しました。\n\r' + data.value);
});


server.on('S_to_C_INIT_DONE', function(data) {
  console.log("[app.js] " + 'S_to_C_INIT_DONE');
//  console.log("[app.js] data.value = " + JSON.stringify(data.booksOne));
//  console.log("[app.js] data.value = " + JSON.stringify(data.booksMany));

  let options = {
    layout:         'fitColumns',
    tooltips:       true,
    addRowPos:      'top',
    history:        true,
    pagination:     'local',
    paginationSize: 20,
    movableColumns: true,
    initialSort:[
      {column:'title', dir:'asc'},
    ],
    rowFormatter: function(row) {
      //row - row component
      let data = row.getData();

      if(data.gid != "") {
        row.getElement().css({'background-color': '#424242'});
        row.getElement().css({'color': '#f5f5f5'});
      }
//        row.getElement().addClass("table-bordered");
    },
    columns:[
      {title:'状態',       field:'status',        align:'center', width:70,  sortable:'true', sorter:'boolean', formatter:'tickCross', editable:true,                                                   cellClick:function(e, cell){updateTable()}, },
      {title:'Global ID',  field:'gid',           align:'left',   width:100, sortable:'true', sorter:'number',  formatter:'plaintext',                 editor:'input', cssClass:'tabulator-background', cellClick:function(e, cell){console.log("cell click : gid")}, },
      {title:'email',      field:'email',         align:'left',   width:150, sortable:'true', sorter:'string',  formatter:'plaintext',                 editor:'input', cssClass:'tabulator-background', cellClick:function(e, cell){console.log("cell click : email")}, },
      {title:'備考',       field:'comment',       align:'left',   width:150, sortable:'true', sorter:'string',  formatter:'plaintext', editable:true,  },
      {title:'貸し出し日', field:'date',          align:'center', width:110, sortable:'true', sorter:'date',    formatter:'plaintext', editable:false,                                                  cellClick:function(e, cell){console.log("cell click : date")}, },
      {title:'返却期限',   field:'deadline',      align:'center', width:100, sortable:'true', sorter:'date',    formatter:'plaintext', editable:false,                                                  cellClick:function(e, cell){console.log("cell click : deadline")}, },
      {title:'残日数',     field:'progress',      align:'left',   width:80,                   sorter:'number',  formatter:'progress',  },
      {title:'Rating',     field:'rating',        align:'center', width:120,                                    formatter:'star',      editable:true,  editor:true, formatterParams:{stars:6}, cellEdited:function(e, cell){updateTable()}, },
      {title:'貸出回数',   field:'count',         align:'left',   width:120,                  sorter:'number',  formatter:'progress',  },
      {title:'タイトル',   field:'title',         align:'left',   width:400, sortable:'true', sorter:'string',  formatter:'plaintext', editable:false, },
      {title:'著者',       field:'author',        align:'left',   width:150, sortable:'true', sorter:'string',  formatter:'plaintext', editable:false, },
      {title:'出版社',     field:'publisher',     align:'left',   width:150, sortable:'true', sorter:'string',  formatter:'plaintext', editable:false, },
      {title:'初版',       field:'first_edition', align:'left',   width:100, sortable:'true', sorter:'string',  formatter:'plaintext', editable:false, },
      {title:'ISBN',       field:'ISBN',          align:'left',   width:150, sortable:'true', sorter:'number',  formatter:'plaintext', editable:false, },
      {title:'言語',       field:'language',      align:'left',   width:100, sortable:'true', sorter:'string',  formatter:'plaintext', editable:false, },
      {title:'カテゴリー', field:'category',      align:'left',   width:200, sortable:'true', sorter:'string',  formatter:'plaintext', editable:false, },
      {title:'出版形態',   field:'publication',   align:'left',   width:100, sortable:'true', sorter:'string',  formatter:'plaintext', editable:false, },
      {title:'入庫日',     field:'arrival_date',  align:'left',   width:100, sortable:'true', sorter:'string',  formatter:'plaintext', editable:false, },
    ],
  };

  // 一冊のみの本のテーブル
  $('#tabulator-table-one').tabulator(options);
  $('#tabulator-table-one').tabulator('setData', data.booksOne);

  // 複数冊ある本のテーブル
  $('#tabulator-table-many').tabulator(options);
  $('#tabulator-table-many').tabulator('setData', data.booksMany);

});


server.on('S_to_C_UPDATE_DONE', function(data) {
  console.log("[app.js] " + 'S_to_C_UPDATE_DONE');
  console.log("[app.js] data.ret   = " + data.ret);
//  console.log("[app.js] data.value = " + JSON.stringify(data.booksOne));
//  console.log("[app.js] data.value = " + JSON.stringify(data.booksMany));

  if(data.ret == false) {
    alert('この書籍は持ち出し禁止です。');
  }

  $('#tabulator-table-one').tabulator('setData', data.booksOne);
  $('#tabulator-table-many').tabulator('setData', data.booksMany);
});


//-----------------------------------------------------------------------------
// ドキュメント・オブジェクトから受け取るイベント


//-----------------------------------------------------------------------------
/**
 * 一冊のみの本のテーブルのデータを送信する
 * @param {void}
 * @return {void}
 * @example
 * updateTable();
*/
function updateTable() {
  console.log("[app.js] updateTable()");

  let booksOne  = $('#tabulator-table-one').tabulator('getData');
  let booksMany = $('#tabulator-table-many').tabulator('getData');

  console.log("[app.js] server.emit(" + 'C_to_S_UPDATE' + ")");
  server.emit('C_to_S_UPDATE', {booksOne: booksOne, booksMany: booksMany});

}


