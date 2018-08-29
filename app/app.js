/**
 * @fileoverview アプリケーション UI
 * @author       Ryoji Morita
 * @version      0.0.1
*/
//var sv_ip   = 'book.rp.lfx.sony.co.jp';     // node.js server の IP アドレス
//var sv_ip   = '43.2.100.151';               // node.js server の IP アドレス
var sv_ip   = '192.168.91.129';               // node.js server の IP アドレス
var sv_port = 6000;                           // node.js server の port 番号

var server = io.connect( 'http://' + sv_ip + ':' + sv_port ); //ローカル


//-----------------------------------------------------------------------------
//-------------------------------------
var obj_visitor_ranking = {chart:null, data:null, type:'column', color:'#5D4037', title:'訪問数ランキング', unit:'[回]'};
var obj_visitor_daily   = {chart:null, data:null, type:'column', color:'#8D6E63', title:'一日のデータ', unit:'[人]'};


// ブラウザオブジェクトから受け取るイベント
window.onload = function(){
  console.log( "[app.js] window.onloaded" );

  obj_visitor_ranking = makeChartVisitorRanking( 'cid_visitor_ranking', obj_visitor_ranking );
  obj_visitor_ranking.chart.render();

  obj_visitor_daily = makeChartDaily( 'cid_visitor_daily', obj_visitor_daily );
  obj_visitor_daily.chart.render();

  console.log( "[app.js] server.emit(" + 'C_to_S_GET_VISITOR' + ")" );
  server.emit( 'C_to_S_GET_VISITOR' );
};


window.onunload = function(){
  console.log( "[app.js] window.onunloaded" );
};


/**
 * 1 day のデータを表示するグラフ ( チャート ) を作成する。
 * @param {string} domid - グラフを表示する DOM の ID 名
 * @param {object} obj - グラフ化する対象のオブジェクト
 * @return {string} chart - 作成するグラフのオブジェクトとデータ
 * @example
 * makeChartDaily( 'cid_visitor_daily', obj_visitor_daily );
*/
function makeChartDaily( domid, obj ){
  console.log( "[app.js] makeChartDaily()" );
  console.log( "[app.js] domid = " + domid );

  var data = new Array({label:'00-00', y:0}, {label:'01-00', y:0}, {label:'02-00', y:0}, {label:'03-00', y:0},
                       {label:'04-00', y:0}, {label:'05-00', y:0}, {label:'06-00', y:0}, {label:'07-00', y:0},
                       {label:'08-00', y:0}, {label:'09-00', y:0}, {label:'10-00', y:0}, {label:'11-00', y:0},
                       {label:'12-00', y:0}, {label:'13-00', y:0}, {label:'14-00', y:0}, {label:'15-00', y:0},
                       {label:'16-00', y:0}, {label:'17-00', y:0}, {label:'18-00', y:0}, {label:'19-00', y:0},
                       {label:'20-00', y:0}, {label:'21-00', y:0}, {label:'22-00', y:0}, {label:'23-00', y:0}
                      );

  var chart = new CanvasJS.Chart(domid, {
    animationEnabled: true,
    animationDuration: 2000,
    title:{text: obj.title,
           fontColor: '#222',
           fontSize: 16,
    },
    subtitles:[{text: '単位: ' + obj.unit,
                fontColor: '#555',
                fontSize: 12,
               }
    ],
    axisX: { labelAngle:-45, labelFontSize:14, labelFontColor:'#222' },
    axisY: { labelFontSize:14, labelFontColor:'#222' },
    data: [{type: obj.type,           // グラフの種類 (area, bar, bubble, column, stackedColumn )
            color: obj.color,
            cursor: 'pointer',
            dataPoints: data        // グラフに描画するデータ
    }]
  });

  return {chart:chart, data:data};
};


/**
 * 訪問回数ランキングを表示するグラフ ( チャート ) を作成する。
 * @param {string} domid - グラフを表示する DOM の ID 名
 * @param {object} obj - グラフ化する対象のオブジェクト
 * @return {string} chart - 作成するグラフのオブジェクトとデータ
 * @example
 * makeChartVisitorRanking( 'cid_visitor_daily', obj_visitor_daily );
*/
function makeChartVisitorRanking( domid, obj ){
  console.log( "[app.js] makeChartVisitorRanking()" );
  console.log( "[app.js] domid = " + domid );

  var data = new Array();

  var chart = new CanvasJS.Chart(domid, {
    animationEnabled: true,
    animationDuration: 2000,
    title:{text: obj.title,
           fontColor: '#222',
           fontSize: 16,
    },
    subtitles:[{text: '単位: ' + obj.unit,
                fontColor: '#555',
                fontSize: 12,
               }
    ],
    axisX: { labelAngle:-90, labelFontSize:10, labelFontColor:'#222' },
    axisY: { minimum: 0, labelFontSize:14, labelFontColor:'#222' },
    data: [{type: obj.type,           // グラフの種類 (area, bar, bubble, column, stackedColumn )
            color: obj.color,
            cursor: 'pointer',
            dataPoints: data        // グラフに描画するデータ
    }]
  });

  return {chart:chart, data:data};
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


server.on( 'S_to_C_VISITOR_ONE_DAY', function( data ){
  console.log( "[app.js] " + 'S_to_C_VISITOR_ONE_DAY' );
  console.log( "[app.js] data.value = " + JSON.stringify(data.value) );

  if( data.ret == false ){
    alert( 'データがありません。\n\r' );
  }

  updateChartDaily( obj_visitor_daily, data.value );
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


