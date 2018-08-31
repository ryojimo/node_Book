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

  console.log( "[app.js] server.emit(" + 'C_to_S_GET_BOOKS' + ")" );
  server.emit( 'C_to_S_GET_BOOKS' );
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


server.on( 'S_to_C_BOOKS', function( data ){
  console.log( "[app.js] " + 'S_to_C_BOOKS' );
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
    paginationSize:20,
    movableColumns:true,
    initialSort:[
        {column:"title", dir:"asc"},
    ],
    columns:[
      {title:"貸し出し可否", field:"on_loan",       align:"center", width:120, sortable:"true", sorter:"string", formatter:"input", editable:false, cellClick:function(e, cell){console.log("cell click : on_loan")}, },
      {title:"Global ID",    field:"gid",           align:"left",   width:150, sortable:"true", sorter:"number",                    editor:true,  cellClick:function(e, cell){console.log("cell click : gid")}, },
      {title:"氏名",         field:"user_name",     align:"left",   width:150, sortable:"true", sorter:"string",                    editor:true,  cellClick:function(e, cell){console.log("cell click : user_name")}, },
      {title:"タイトル",     field:"title",         align:"left",   width:400, sortable:"true", sorter:"string", formatter:"input", editable:false, },
      {title:"著者",         field:"author",        align:"left",   width:150, sortable:"true", sorter:"string", formatter:"input", editable:false, },
      {title:"出版社",       field:"publisher",     align:"left",   width:150, sortable:"true", sorter:"string", formatter:"input", editable:false, },
      {title:"初版",         field:"first_edition", align:"left",   width:100, sortable:"true", sorter:"string", formatter:"input", editable:false, },
      {title:"ISBN",         field:"ISBN",          align:"left",   width:150, sortable:"true", sorter:"number", formatter:"input", editable:false, },
      {title:"言語",         field:"language",      align:"left",   width:100, sortable:"true", sorter:"string", formatter:"input", editable:false, },
      {title:"カテゴリー",   field:"category",      align:"left",   width:200, sortable:"true", sorter:"string", formatter:"input", editable:false, },
      {title:"出版形態",     field:"publication",   align:"left",   width:100, sortable:"true", sorter:"string", formatter:"input", editable:false, },
      {title:"コメント",     field:"comment",       align:"left",   width:200, sortable:"true", sorter:"string", formatter:"input", editable:true,  },
    ],
  });

  $("#tabulator-example").tabulator( "setData", data.value );

//  var data = $("#tabulator-example").tabulator("getData");
//  console.log( "[app.js] data[0] = " + JSON.stringify(data[0]) );

});


