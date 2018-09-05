/**
 * @fileoverview アプリケーション UI
 * @author       Ryoji Morita
 * @version      0.0.1
*/
//var sv_ip   = 'book.rp.lfx.sony.co.jp';     // node.js server の IP アドレス
//var sv_ip   = '43.2.100.151';               // node.js server の IP アドレス
var sv_ip   = '192.168.91.129';               // node.js server の IP アドレス
var sv_port = 3000;                           // node.js server の port 番号

var server = io.connect( 'http://' + sv_ip + ':' + sv_port ); //ローカル


//-----------------------------------------------------------------------------
//-------------------------------------
var obj_visitor_ranking = {chart:null, data:null, type:'column', color:'#5D4037', title:'訪問数ランキング', unit:'[回]'};
var obj_visitor_daily   = {chart:null, data:null, type:'column', color:'#8D6E63', title:'一日のデータ', unit:'[人]'};


// ブラウザオブジェクトから受け取るイベント
window.onload = function(){
  console.log( "[app.js] window.onloaded" );

  console.log( "[app.js] server.emit(" + 'C_to_S_INIT' + ")" );
  server.emit( 'C_to_S_INIT' );
};


window.onunload = function(){
  console.log( "[app.js] window.onunloaded" );
};


//-----------------------------------------------------------------------------
// サーバから受け取るイベント
server.on( 'connect', function(){               // 接続時
  console.log( "[app.js] " + 'connected' );
});


server.on( 'disconnect', function( client ){    // 切断時
  console.log( "[app.js] " + 'disconnected' );
});


server.on( 'S_to_C_DATA', function( data ){
  console.log( "[app.js] " + 'S_to_C_DATA' );
  console.log( "[app.js] data = " + data.value );
//  window.alert( 'コマンドを送信しました。\n\r' + data.value );
});


server.on( 'S_to_C_INIT_DONE', function( data ){
  console.log( "[app.js] " + 'S_to_C_INIT_DONE' );
//  console.log( "[app.js] data.value = " + JSON.stringify(data.value) );

  if( data.ret == false ){
    alert( 'データがありません。\n\r' );
  }

  $("#tabulator-example").tabulator({
    layout:"fitColumns",
    tooltips:true,
    addRowPos:"top",
    history:true,
    pagination:"local",
    paginationSize:15,
    movableColumns:true,
    initialSort:[
        {column:"title", dir:"asc"},
    ],
    columns:[
      {title:"状態",       field:"status",        align:"center", width:70,  sortable:"true", sorter:"boolean", formatter:"tickCross", editable:true, cellClick:function(e, cell){updateTable()}, },
      {title:"Global ID",  field:"gid",           align:"left",   width:100, sortable:"true", sorter:"number", formatter:"plaintext", editor:"input", cellClick:function(e, cell){console.log("cell click : gid")}, },
      {title:"email",      field:"user_name",     align:"left",   width:150, sortable:"true", sorter:"string", formatter:"plaintext", editor:"input", cellClick:function(e, cell){console.log("cell click : user_name")}, },
      {title:"貸し出し日", field:"date",          align:"center", width:100, sortable:"true", sorter:"date",   formatter:"plaintext", editable:false, cellClick:function(e, cell){console.log("cell click : date")}, },
      {title:"返却期限",   field:"deadline",      align:"center", width:100, sortable:"true", sorter:"date",   formatter:"plaintext", editable:false, cellClick:function(e, cell){console.log("cell click : deadline")}, },
      {title:"残日数",     field:"progress",      align:"left",   width:80,                   sorter:"number", formatter:"progress",  },
      {title:"Rating",     field:"rating",        align:"center", width:120,                                   formatter:"star",      formatterParams:{stars:6}, editable:true, },
      {title:"貸出回数",   field:"count",         align:"left",   width:120,                  sorter:"number", formatter:"progress",  },
      {title:"タイトル",   field:"title",         align:"left",   width:400, sortable:"true", sorter:"string", formatter:"plaintext", editable:false, },
      {title:"著者",       field:"author",        align:"left",   width:150, sortable:"true", sorter:"string", formatter:"plaintext", editable:false, },
      {title:"出版社",     field:"publisher",     align:"left",   width:150, sortable:"true", sorter:"string", formatter:"plaintext", editable:false, },
      {title:"初版",       field:"first_edition", align:"left",   width:100, sortable:"true", sorter:"string", formatter:"plaintext", editable:false, },
      {title:"ISBN",       field:"ISBN",          align:"left",   width:150, sortable:"true", sorter:"number", formatter:"plaintext", editable:false, },
      {title:"言語",       field:"language",      align:"left",   width:100, sortable:"true", sorter:"string", formatter:"plaintext", editable:false, },
      {title:"カテゴリー", field:"category",      align:"left",   width:200, sortable:"true", sorter:"string", formatter:"plaintext", editable:false, },
      {title:"出版形態",   field:"publication",   align:"left",   width:100, sortable:"true", sorter:"string", formatter:"plaintext", editable:false, },
      {title:"コメント",   field:"comment",       align:"left",   width:200, sortable:"true", sorter:"string", formatter:"plaintext", editable:true,  },
    ],
  });

  $("#tabulator-example").tabulator( "setData", data.value );
});


server.on( 'S_to_C_UPDATE_DONE', function( data ){
  console.log( "[app.js] " + 'S_to_C_UPDATE_DONE' );
//  console.log( "[app.js] data.value = " + JSON.stringify(data.value) );
  $("#tabulator-example").tabulator( "setData", data.value );
});


//-----------------------------------------------------------------------------
// ドキュメント・オブジェクトから受け取るイベント


//-----------------------------------------------------------------------------
/**
 * コメントのデータを送信する
 * @param {void}
 * @return {void}
 * @example
 * updateTable();
*/
function updateTable(){
  console.log( "[app.js] updateTable()" );

  var data = $("#tabulator-example").tabulator( "getData" );
//  console.log( "[app.js] data = " + data );

//  $("#tabulator-example").tabulator( "setData", data );

  console.log( "[app.js] server.emit(" + 'C_to_S_UPDATE' + ")" );
  server.emit( 'C_to_S_UPDATE', data );

}


/**
 * 数字が 1 桁の場合に 0 埋めで 2 桁にする
 * @param {number} num - 数値
 * @return {number} num - 0 埋めされた 2 桁の数値
 * @example
 * toDoubleDigits( 8 );
*/
var toDoubleDigits = function( num ){
//  console.log( "[main.js] toDoubleDigits()" );
//  console.log( "[main.js] num = " + num );
  num += '';
  if( num.length === 1 ){
    num = '0' + num;
  }
  return num;
};


