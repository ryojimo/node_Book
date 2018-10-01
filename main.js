/**
 * @fileoverview メイン・システム
 * @author       Ryoji Morita
 * @version      0.0.1
*/

// 必要なライブラリをロード
var http     = require( 'http' );
var socketio = require( 'socket.io' );
var fs       = require( 'fs' );
var colors   = require( 'colors' );
require( 'date-utils' );
var schedule = require( 'node-schedule' );
var express  = require( 'express' );

const DataBooks   = require( './js/DataBooks' );


// Ver. 表示
var now = new Date();
console.log( "[main.js] " + now.toFormat("YYYY年MM月DD日 HH24時MI分SS秒").rainbow );
console.log( "[main.js] " + "ver.01 : app.js".rainbow );
console.log( "[main.js] " + "access to http://localhost:7000" );

// Express オブジェクトを生成
var ex_app = express();
var ex_server = ex_app.listen( 7001, function(){
    console.log( "[main.js] " + "Node.js is listening to PORT:" + ex_server.address().port );
});

// サーバー・オブジェクトを生成
var server = http.createServer();

// request イベント処理関数をセット
server.on( 'request', doRequest );

// 待ち受けスタート
server.listen( process.env.VMC_APP_PORT || 7000 );
console.log( "[main.js] Server running!" );

// request イベント処理
function doRequest(
  req,    // http.IncomingMessage オブジェクト : クライアントからのリクエストに関する機能がまとめられている
  res     // http.serverResponse  オブジェクト : サーバーからクライアントへ戻されるレスポンスに関する機能がまとめられている
){
  switch( req.url ){
  case '/':
    fs.readFile( './app/app.html', 'UTF-8',
      function( err, data ){
        if( err ){
          res.writeHead( 404, {'Content-Type': 'text/html'} );
          res.write( 'File Not Found.' );
          res.end();
          return;
        }
        res.writeHead( 200, {'Content-Type': 'text/html',
                             'Access-Control-Allow-Origin': '*'
                      } );
        res.write( data );
        res.end();
      }
    );
  break;
  case '/app.js':
    fs.readFile( './app/app.js', 'UTF-8',
      function( err, data ){
        res.writeHead( 200, {'Content-Type': 'application/javascript',
                             'Access-Control-Allow-Origin': '*'
                      } );
        res.write( data );
        res.end();
      }
    );
  break;
  case '/style.css':
    fs.readFile( './app/style.css', 'UTF-8',
      function( err, data ){
        res.writeHead( 200, {'Content-Type': 'text/css',
                             'Access-Control-Allow-Origin': '*'
                      } );
        res.write( data );
        res.end();
      }
    );
  break;
  }
}


var io = socketio.listen( server );


//-----------------------------------------------------------------------------
// 起動の処理関数
//-----------------------------------------------------------------------------
var timerFlg;

var books   = new DataBooks();


startSystem();


/**
 * システムを開始する
 * @param {void}
 * @return {void}
 * @example
 * startSystem();
*/
function startSystem() {
  console.log( "[main.js] startSystem()" );
};


//-----------------------------------------------------------------------------
// クライアントからコネクションが来た時の処理関数 ( Express )
//-----------------------------------------------------------------------------
ex_app.get("/api/:which/:gid", function(req, res, next){
  console.log( "[main.js] ex_app.get( \"/api/gid/:gid\" )" );
  console.log( "[main.js] which = " + req.params.which );
  console.log( "[main.js] gid   = " + req.params.gid );

  var collection = req.params.which;
  var query = { 'gid': req.params.gid };

  var obj = books.Query( collection, query, function( err, doc ){
    console.log( "[main.js] err     = " + err );
    console.log( "[main.js] doc     = " + JSON.stringify(doc) );
    res.json( doc );
  });
});


//-----------------------------------------------------------------------------
// クライアントからコネクションが来た時の処理関数
//-----------------------------------------------------------------------------
io.sockets.on( 'connection', function( socket ){

  // 切断したときに送信
  socket.on( 'disconnect', function(){
    console.log( "[main.js] " + 'disconnect' );
//  io.sockets.emit('S_to_C_DATA', {value:'user disconnected'});
  });


  // Client to Server
  socket.on( 'C_to_S_NEW', function( data ){
    console.log( "[main.js] " + 'C_to_S_NEW' );
  });


  socket.on( 'C_to_S_DELETE', function( data ){
    console.log( "[main.js] " + 'C_to_S_DELETE' );
  });


  socket.on( 'C_to_S_INIT', function( data ){
    console.log( "[main.js] " + 'C_to_S_INIT' );
    console.log( "[main.js] data.which = " + data.which );

    var collection = data.which;

    var obj = books.GetAllDocs( collection, function( err, data ){
      console.log( "[main.js] err     = " + err );
//      console.log( "[main.js] doc     = " + JSON.stringify(data) );

        for(let i = 0; i < data.length; i++){
          if( data[i].date != "" ){
            data[i].progress = getRestDay( data[i].deadline );
          }
        }

      io.sockets.emit( 'S_to_C_INIT_DONE', {ret:err, which:collection, value:data} );
    });
  });


  socket.on( 'C_to_S_UPDATE', function( data ){
    console.log( "[main.js] " + 'C_to_S_UPDATE' );
    console.log( "[main.js] data.which = " + data.which );
//    console.log( "[main.js] data.value = " + JSON.stringify(data.value) );

    var ret = false;
    var collection = data.which;

    var obj = books.GetAllDocs( collection, function( err, data_org ){
      console.log( "[main.js] err     = " + err );

//      console.log( "[main.js] data_org = " + JSON.stringify(data_org) );
      console.log( "[main.js] data.value.length = " + data.value.length );
      for(let i = 0; i < data.value.length; i++){
        if( data.value[i].gid       != data_org[i].gid &&
            data.value[i].user_name != data_org[i].user_name ){

          if( data.value[i].gid == "" && data.value[i].user_name == "" ){
            data.value[i].status  = false;
            data.value[i].date     = "";
            data.value[i].progress = 0;
            data.value[i].deadline = "";
          } else {
            data.value[i].status  = true;
            data.value[i].date     = yyyymmdd( 0 );
            data.value[i].progress = 14;
            data.value[i].deadline = yyyymmdd( data.value[i].progress );
            data.value[i].count++;
          }

          console.log( "[main.js] data.value[" + i + "] = " + JSON.stringify(data.value[i]) );
          if( data.value[i].comment.match(/禁持出/) ){
            ret = false;
          } else {
            ret = true;
            var obj = books.UpdateDoc( collection, data.value[i]._id, data.value[i] );
          }
        } else if( data.value[i].rating != data_org[i].rating ){
          console.log( "[main.js] data.value[" + i + "] = " + JSON.stringify(data.value[i]) );
          ret = true;
          var obj = books.UpdateDoc( collection, data.value[i]._id, data.value[i] );
        }
      }

//      console.log( "[main.js] doc     = " + JSON.stringify(data.value) );
      io.sockets.emit( 'S_to_C_UPDATE_DONE', {ret:ret, which:collection, value:data.value} );
    });
  });


});


/**
 * 残日数を取得する
 * @param {number} offset - "2018-09-06" のような形式の文字列
 * @return {string} day - 残日数
 * @example
 * getRestDay( "2018-09-06" );
*/
var getRestDay = function( deadline ){
  console.log( "[main.js] getRestDay()" );
  var now = new Date();
  var tgday = deadline.replace( '-', '/' );
  var days = Math.ceil( (Date.parse(tgday) - now.getTime()) / (24 * 60 * 60 * 1000));

  console.log( "[main.js] now   = " + now );
  console.log( "[main.js] tgday = " + tgday );
  console.log( "[main.js] days  = " + days );

  return days;
};


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


/**
 * 現在の日付に offset を足した日付を YYYY-MM-DD 形式で取得する
 * @param {number} offset - 数値
 * @return {string} day - 日付
 * @example
 * yyyymmdd();
*/
var yyyymmdd = function( offset ){
//  console.log( "[main.js] yyyymmdd()" );
  var date = new Date();

  date.setDate( date.getDate() + offset );

  var yyyy = date.getFullYear();
  var mm   = toDoubleDigits( date.getMonth() + 1 );
  var dd   = toDoubleDigits( date.getDate() );

  var day = yyyy + '-' + mm + '-' + dd;
//  console.log( "[main.js] day = " + day );
  return day;
};


/**
 * 現在の時刻を HH:MM:SS 形式で取得する
 * @param {void}
 * @return {string} time - 時刻
 * @example
 * hhmmss();
*/
var hhmmss = function(){
  console.log( "[main.js] hhmmss()" );
  var date = new Date();

  var hour = toDoubleDigits( date.getHours() );
  var min  = toDoubleDigits( date.getMinutes() );
  var sec  = toDoubleDigits( date.getSeconds() );

  var time = hour + ':' + min + ':' + sec;
  console.log( "[main.js] time = " + time );
  return time;
};


