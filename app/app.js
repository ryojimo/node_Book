/**
 * @fileoverview アプリケーション UI
 * @author       Ryoji Morita
 * @version      0.0.1
*/
//var sv_ip   = 'book.rp.lfx.sony.co.jp';     // node.js server の IP アドレス
//var sv_ip   = '43.2.100.159';             // node.js server の IP アドレス
var sv_ip   = '192.168.91.11';           // node.js server の IP アドレス
var sv_port = 4002;                         // node.js server の port 番号

var server = io.connect( 'http://' + sv_ip + ':' + sv_port ); //ローカル


//-----------------------------------------------------------------------------
//-------------------------------------
// ブラウザオブジェクトから受け取るイベント
window.onload = function(){
  console.log( "[app.js] window.onloaded" );

  console.log( "[app.js] server.emit(" + 'C_to_S_INIT' + ")" );
  server.emit( 'C_to_S_INIT', {which:'one_2018_09'} );
  server.emit( 'C_to_S_INIT', {which:'many_2018_09'} );
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
  console.log( "[app.js] data.ret   = " + data.ret );
  console.log( "[app.js] data.which = " + data.which );
  console.log( "[app.js] data.value = " + JSON.stringify(data.value) );

  if( data.ret == false ){
    alert( 'データがありません。\n\r' );
  }

  if( data.which == 'one_2018_09' ){
    // 一冊のみの本のテーブル
    $("#tabulator-table-one").tabulator({
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
      rowFormatter:function(row){
        //row - row component
        var data = row.getData();

        if(data.gid != ""){
          row.getElement().css({"background-color":"#424242"});
          row.getElement().css({"color":"#f5f5f5"});
        }
//        row.getElement().addClass("table-bordered");
      },
      columns:[
        {title:"状態",       field:"status",        align:"center", width:70,  sortable:"true", sorter:"boolean", formatter:"tickCross", editable:true,                                                   cellClick:function(e, cell){updateTableOne()}, },
        {title:"Global ID",  field:"gid",           align:"left",   width:100, sortable:"true", sorter:"number",  formatter:"plaintext",                 editor:"input", cssClass:"tabulator-background", cellClick:function(e, cell){console.log("cell click : gid")}, },
        {title:"email",      field:"user_name",     align:"left",   width:150, sortable:"true", sorter:"string",  formatter:"plaintext",                 editor:"input", cssClass:"tabulator-background", cellClick:function(e, cell){console.log("cell click : user_name")}, },
        {title:"貸し出し日", field:"date",          align:"center", width:110, sortable:"true", sorter:"date",    formatter:"plaintext", editable:false,                                                  cellClick:function(e, cell){console.log("cell click : date")}, },
        {title:"返却期限",   field:"deadline",      align:"center", width:100, sortable:"true", sorter:"date",    formatter:"plaintext", editable:false,                                                  cellClick:function(e, cell){console.log("cell click : deadline")}, },
        {title:"残日数",     field:"progress",      align:"left",   width:80,                   sorter:"number",  formatter:"progress",  },
        {title:"Rating",     field:"rating",        align:"center", width:120,                                    formatter:"star",      editable:true,  editor:true, formatterParams:{stars:6}, cellEdited:function(e, cell){updateTableOne()}, },
        {title:"貸出回数",   field:"count",         align:"left",   width:120,                  sorter:"number",  formatter:"progress",  },
        {title:"タイトル",   field:"title",         align:"left",   width:400, sortable:"true", sorter:"string",  formatter:"plaintext", editable:false, },
        {title:"著者",       field:"author",        align:"left",   width:150, sortable:"true", sorter:"string",  formatter:"plaintext", editable:false, },
        {title:"出版社",     field:"publisher",     align:"left",   width:150, sortable:"true", sorter:"string",  formatter:"plaintext", editable:false, },
        {title:"初版",       field:"first_edition", align:"left",   width:100, sortable:"true", sorter:"string",  formatter:"plaintext", editable:false, },
        {title:"ISBN",       field:"ISBN",          align:"left",   width:150, sortable:"true", sorter:"number",  formatter:"plaintext", editable:false, },
        {title:"言語",       field:"language",      align:"left",   width:100, sortable:"true", sorter:"string",  formatter:"plaintext", editable:false, },
        {title:"カテゴリー", field:"category",      align:"left",   width:200, sortable:"true", sorter:"string",  formatter:"plaintext", editable:false, },
        {title:"出版形態",   field:"publication",   align:"left",   width:100, sortable:"true", sorter:"string",  formatter:"plaintext", editable:false, },
        {title:"備考",       field:"comment",       align:"left",   width:200, sortable:"true", sorter:"string",  formatter:"plaintext", editable:true,  },
      ],
    });

    $("#tabulator-table-one").tabulator( "setData", data.value );
  }

  if( data.which == 'many_2018_09' ){
    // 複数冊ある本のテーブル
    $("#tabulator-table-many").tabulator({
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
      rowFormatter:function(row){
        //row - row component
        var data = row.getData();

        if(data.gid != ""){
          row.getElement().css({"background-color":"#424242"});
          row.getElement().css({"color":"#f5f5f5"});
        }
//        row.getElement().addClass("table-bordered");
      },
      columns:[
        {title:"状態",       field:"status",        align:"center", width:70,  sortable:"true", sorter:"boolean", formatter:"tickCross", editable:true,                                                   cellClick:function(e, cell){updateTableMany()}, },
        {title:"Global ID",  field:"gid",           align:"left",   width:100, sortable:"true", sorter:"number",  formatter:"plaintext",                 editor:"input", cssClass:"tabulator-background", cellClick:function(e, cell){console.log("cell click : gid")}, },
        {title:"email",      field:"user_name",     align:"left",   width:150, sortable:"true", sorter:"string",  formatter:"plaintext",                 editor:"input", cssClass:"tabulator-background", cellClick:function(e, cell){console.log("cell click : user_name")}, },
        {title:"貸し出し日", field:"date",          align:"center", width:110, sortable:"true", sorter:"date",    formatter:"plaintext", editable:false,                                                  cellClick:function(e, cell){console.log("cell click : date")}, },
        {title:"返却期限",   field:"deadline",      align:"center", width:100, sortable:"true", sorter:"date",    formatter:"plaintext", editable:false,                                                  cellClick:function(e, cell){console.log("cell click : deadline")}, },
        {title:"残日数",     field:"progress",      align:"left",   width:80,                   sorter:"number",  formatter:"progress",  },
        {title:"Rating",     field:"rating",        align:"center", width:120,                                    formatter:"star",      editable:true,  editor:true, formatterParams:{stars:6}, cellEdited:function(e, cell){updateTableMany()}, },
        {title:"貸出回数",   field:"count",         align:"left",   width:120,                  sorter:"number",  formatter:"progress",  },
        {title:"タイトル",   field:"title",         align:"left",   width:400, sortable:"true", sorter:"string",  formatter:"plaintext", editable:false, },
        {title:"著者",       field:"author",        align:"left",   width:150, sortable:"true", sorter:"string",  formatter:"plaintext", editable:false, },
        {title:"出版社",     field:"publisher",     align:"left",   width:150, sortable:"true", sorter:"string",  formatter:"plaintext", editable:false, },
        {title:"初版",       field:"first_edition", align:"left",   width:100, sortable:"true", sorter:"string",  formatter:"plaintext", editable:false, },
        {title:"ISBN",       field:"ISBN",          align:"left",   width:150, sortable:"true", sorter:"number",  formatter:"plaintext", editable:false, },
        {title:"言語",       field:"language",      align:"left",   width:100, sortable:"true", sorter:"string",  formatter:"plaintext", editable:false, },
        {title:"カテゴリー", field:"category",      align:"left",   width:200, sortable:"true", sorter:"string",  formatter:"plaintext", editable:false, },
        {title:"出版形態",   field:"publication",   align:"left",   width:100, sortable:"true", sorter:"string",  formatter:"plaintext", editable:false, },
        {title:"備考",       field:"comment",       align:"left",   width:200, sortable:"true", sorter:"string",  formatter:"plaintext", editable:true,  },
      ],
    });

    $("#tabulator-table-many").tabulator( "setData", data.value );
  }

});


server.on( 'S_to_C_UPDATE_DONE', function( data ){
  console.log( "[app.js] " + 'S_to_C_UPDATE_DONE' );
  console.log( "[app.js] data.ret   = " + data.ret );
  console.log( "[app.js] data.which = " + data.which );
  //console.log( "[app.js] data.value = " + JSON.stringify(data.value) );

  if( data.which == 'one_2018_09' ){
    $("#tabulator-table-one").tabulator( "setData", data.value );
  } else if( data.which == 'many_2018_09' ){
    $("#tabulator-table-many").tabulator( "setData", data.value );
  }
});


//-----------------------------------------------------------------------------
// ドキュメント・オブジェクトから受け取るイベント


//-----------------------------------------------------------------------------
/**
 * 一冊のみの本のテーブルのデータを送信する
 * @param {void}
 * @return {void}
 * @example
 * updateTableOne();
*/
function updateTableOne(){
  console.log( "[app.js] updateTableOne()" );

  var data = $("#tabulator-table-one").tabulator( "getData" );
//  console.log( "[app.js] data = " + data );

  console.log( "[app.js] server.emit(" + 'C_to_S_UPDATE' + ")" );
  server.emit( 'C_to_S_UPDATE', {which:'one_2018_09', value:data} );

}


/**
 * 複数冊ある本のテーブルのデータを送信する
 * @param {void}
 * @return {void}
 * @example
 * updateTableMany();
*/
function updateTableMany(){
  console.log( "[app.js] updateTableMany()" );

  var data = $("#tabulator-table-many").tabulator( "getData" );
//  console.log( "[app.js] data = " + data );

  console.log( "[app.js] server.emit(" + 'C_to_S_UPDATE' + ")" );
  server.emit( 'C_to_S_UPDATE', {which:'many_2018_09', value:data} );

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


