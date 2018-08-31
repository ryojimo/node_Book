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
  console.log( "[app.js] " + 'S_to_C_VISITOR_ONE_DAY' );
  console.log( "[app.js] data.value = " + JSON.stringify(data.value) );

  if( data.ret == false ){
    alert( 'データがありません。\n\r' );
  }

//  updateChartDaily( obj_visitor_daily, data.value );
});


server.on( 'S_to_C_VISITOR', function( data ){
  console.log( "[app.js] " + 'S_to_C_VISITOR' );
  console.log( "[app.js] data = " + JSON.stringify(data) );

  if( data.ret == false ){
    alert( 'データがありません。\n\r' );
  }

  updateChartVisitorRanking( '訪問数ランキング', data );
});


//-------------------------------------
/**
 * 1 day のセンサ値をグラフ表示する。
 * @param {object} obj_chart - 対象の chart オブジェクト
 * @param {object} data - グラフに表示するデータ
 * @return {void}
 * @example
 * updateChartDaily( 'temp', obj );
*/
function updateChartDaily( obj_chart, data ){
  console.log( "[app.js] updateChartDaily()" );

//  var obj = (new Function('return ' + data))();

  var i = 0;
  for( var key in data ){
    obj_chart.data[i].label = key;
    obj_chart.data[i].y     = data[key];
    i++;
  }

  obj_chart.chart.options.title.text = obj_chart.title;
  obj_chart.chart.options.data.dataPoints = obj_visitor_daily.data;
  obj_chart.chart.render();
}


/**
 * 訪問回数ランキングをグラフ表示する。
 * @param {string} title - グラフに表示するタイトル
 * @param {object} data - グラフに表示するデータ
 * @return {void}
 * @example
 * updateChartVisitorRanking( 'temp', obj );
*/
function updateChartVisitorRanking( title, data ){
  console.log( "[app.js] updateChartVisitorRanking()" );
  console.log( "[app.js] title = " + title );

  console.log( "[app.js] data = " + JSON.stringify(data) );

  obj_visitor_ranking.data.length = 0;
  var i = 0;
  for( i = 0; i < data.length; i++ ){
    obj_visitor_ranking.data.push( {label:data[i].name, y:data[i].cnt} );
  }

  obj_visitor_ranking.chart.options.title.text = title;
  obj_visitor_ranking.chart.options.data.dataPoints = obj_visitor_ranking.data;
  obj_visitor_ranking.chart.render();
}


//-----------------------------------------------------------------------------
// ドキュメント・オブジェクトから受け取るイベント


//-----------------------------------------------------------------------------
/**
 * 指定した 1 日の、訪問人数を取得するためのコマンドを送る。
 * @return {void}
 * @example
 * sendGetCmdVisitorOneDay();
*/
function sendGetCmdVisitorOneDay(){
  console.log( "[app.js] sendGetCmdVisitorOneDay()" );

  var date   = $('#val_date_visitor').val();
  console.log( "[app.js] date   = " + date );

  if( date < '2018-01-24' ){
    alert( "2018/01/24 以降を指定してください。" );
  }

  var obj = { date:date };
  console.log( "[app.js] server.emit(" + 'C_to_S_GET_VISITOR_ONE_DAY' + ")" );
  server.emit( 'C_to_S_GET_VISITOR_ONE_DAY', obj );
}


