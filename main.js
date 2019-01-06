/**
 * @fileoverview メイン・システム
 * @author       Ryoji Morita
 * @version      0.0.1
*/

// 必要なライブラリをロード
let http     = require('http');
let socketio = require('socket.io');
let fs       = require('fs');
let colors   = require('colors');
require('date-utils');
let schedule = require('node-schedule');
let express  = require('express');

let Converter = require('csvtojson').Converter;

const ApiFileSystem = require('./js/ApiFileSystem');
const DataBook   = require('./js/DataBook');


// Ver. 表示
let now = new Date();
console.log("[main.js] " + now.toFormat("YYYY年MM月DD日 HH24時MI分SS秒").rainbow);
console.log("[main.js] " + "ver.01 : app.js".rainbow);
console.log("[main.js] " + "access to http://localhost:7000");

/*
// Express オブジェクトを生成
let ex_app = express();
let ex_server = ex_app.listen(7001, function() {
    console.log("[main.js] " + "Node.js is listening to PORT:" + ex_server.address().port);
});
*/

// サーバー・オブジェクトを生成
let server = http.createServer();

// request イベント処理関数をセット
server.on('request', doRequest);

// 待ち受けスタート
server.listen(process.env.VMC_APP_PORT || 7000);
console.log("[main.js] Server running!");

// request イベント処理
function doRequest(
  req,    // http.IncomingMessage オブジェクト : クライアントからのリクエストに関する機能がまとめられている
  res     // http.serverResponse  オブジェクト : サーバーからクライアントへ戻されるレスポンスに関する機能がまとめられている
){
  switch(req.url) {
  case '/':
    fs.readFile('./app/app.html', 'UTF-8', function(err, data) {
      if(err) {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.write('File Not Found.');
        res.end();
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/html',
                          'Access-Control-Allow-Origin': '*'
                    });
      res.write(data);
      res.end();
    });
  break;
  case '/app.js':
    fs.readFile('./app/app.js', 'UTF-8', function(err, data) {
      res.writeHead(200, {'Content-Type': 'application/javascript',
                          'Access-Control-Allow-Origin': '*'
                   });
      res.write(data);
      res.end();
    });
  break;
  case '/style.css':
    fs.readFile('./app/style.css', 'UTF-8', function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/css',
                          'Access-Control-Allow-Origin': '*'
                   });
      res.write(data);
      res.end();
    });
  break;
  }
}


let io = socketio.listen(server);


//-----------------------------------------------------------------------------
// 起動の処理関数
//-----------------------------------------------------------------------------
let converterOne  = new Converter({});
let converterMany = new Converter({});

let g_apiFileSystem = new ApiFileSystem();

let g_jsonBooksOne = null;
let g_jsonBooksMany = null;
let g_jsonBooksRent = new Array();

let g_arrayObjBooksOne = new Array();
let g_arrayObjBooksMany = new Array();
let g_arrayObjBooksRent = new Array();

startSystem();


/**
 * システムを開始する
 * @param {void}
 * @return {void}
 * @example
 * startSystem();
*/
function startSystem() {
  console.log("[main.js] startSystem()");

  // BT_books_one.csv を読み出して json 形式の配列データを取得する
  converterOne.fromFile('./data/BT_books_one.csv')
  .then((jsonObj)=> {
//    console.log("[main.js] jsonObj = " + JSON.stringify(jsonObj));
    g_jsonBooksOne = jsonObj;
  });

  // BT_books_many.csv を読み出して json 形式の配列データを取得する
  converterMany.fromFile('./data/BT_books_many.csv')
  .then((jsonObj)=> {
//    console.log("[main.js] jsonObj = " + JSON.stringify(jsonObj));
    g_jsonBooksMany = jsonObj;
  });

  // 貸出状態になっている本の全情報の json 形式の配列データを取得する
  let ret = null;
  let jsonObj = null;

  let filenames = fs.readdirSync('/media/pi/USBDATA/book/');
  console.log("[main.js] filenames = " + filenames);
  try {
    for(value of filenames) {
      let file = '/media/pi/USBDATA/book/' + value;
      console.log("[main.js] file = " + file);

      fs.statSync(file);
      ret = fs.readFileSync(file, 'utf8');
      jsonObj = (new Function("return " + ret))();
      g_jsonBooksRent.push(jsonObj);
    }

    console.log("[main.js] g_jsonBooksRent = " + JSON.stringify(g_jsonBooksRent));
  } catch(err) {
    if(err.code === 'ENOENT') {
      console.log("[main.js] file does not exist.");
    } else {
      console.log("[main.js] error happens.");
    }
  }
};


/*
//-----------------------------------------------------------------------------
// クライアントからコネクションが来た時の処理関数 ( Express )
//-----------------------------------------------------------------------------
ex_app.get("/api/:which/:gid", function(req, res, next) {
  console.log("[main.js] ex_app.get( \"/api/gid/:gid\" )");
  console.log("[main.js] which = " + req.params.which);
  console.log("[main.js] gid   = " + req.params.gid);

  let collection = req.params.which;
  let query = {'gid': req.params.gid};

  let obj = g_books.query(collection, query, function(err, doc) {
    console.log("[main.js] err     = " + err);
    console.log("[main.js] doc     = " + JSON.stringify(doc));
    res.json(doc);
  });
});


*/


//-----------------------------------------------------------------------------
// クライアントからコネクションが来た時の処理関数
//-----------------------------------------------------------------------------
io.sockets.on('connection', function(socket) {

  // 切断したときに送信
  socket.on('disconnect', function() {
    console.log("[main.js] " + 'disconnect');
//  io.sockets.emit('S_to_C_DATA', {value:'user disconnected'});
  });


  // Client to Server
  socket.on('C_to_S_NEW', function(data) {
    console.log("[main.js] " + 'C_to_S_NEW');
  });


  socket.on('C_to_S_DELETE', function(data) {
    console.log("[main.js] " + 'C_to_S_DELETE');
  });


  socket.on('C_to_S_INIT', function() {
    console.log("[main.js] " + 'C_to_S_INIT');

    // Array オブジェクトに DataBook オブジェクトをセット
    if(g_jsonBooksOne != null && g_arrayObjBooksOne.length == 0) {
      for(let value of g_jsonBooksOne) {
        let obj = new DataBook(value);
        g_arrayObjBooksOne.push(obj);
      }
    }

    if(g_jsonBooksMany != null && g_arrayObjBooksMany.length == 0) {
      for(let value of g_jsonBooksMany) {
        let obj = new DataBook(value);
        g_arrayObjBooksMany.push(obj);
      }
    }

    if(g_jsonBooksRent.length != 0 && g_arrayObjBooksRent.length == 0) {
      for(let value of g_jsonBooksRent) {
        let obj = new DataBook(value);
        g_arrayObjBooksRent.push(obj);
      }
    }

    // 既に貸出済みのデータがあれば、g_arrayObjBooksOne, g_arrayObjBooksMany の内容を更新する
    for(let i=0; i<g_arrayObjBooksOne.length; i++) {
      let jsonObj = g_arrayObjBooksOne[i].get();

      for(let br of g_arrayObjBooksRent) {
        let jsonRent = br.get();

        if(jsonObj._id == jsonRent._id && (jsonObj.gid != jsonRent.gid || jsonObj.email != jsonRent.email)) {
          g_arrayObjBooksOne[i].set(jsonRent);
        }
      }
    }

    for(let i=0; i<g_arrayObjBooksMany.length; i++) {
      let jsonObj = g_arrayObjBooksMany[i].get();

      for(let br of g_arrayObjBooksRent) {
        let jsonRent = br.get();

        if(jsonObj._id == jsonRent._id && (jsonObj.gid != jsonRent.gid || jsonObj.email != jsonRent.email)) {
          g_arrayObjBooksMany[i].set(jsonRent);
        }
      }
    }

    let one = new Array();
    let many = new Array();

    for(let value of g_arrayObjBooksOne) {
      one.push(value.get());
    }

    for(let value of g_arrayObjBooksMany) {
      many.push(value.get());
    }

    console.log("[main.js] g_arrayObjBooksOne.length  = " + g_arrayObjBooksOne.length);
    console.log("[main.js] g_arrayObjBooksMany.length = " + g_arrayObjBooksMany.length);
    io.sockets.emit('S_to_C_INIT_DONE', {booksOne: one, booksMany: many});
  });


  socket.on('C_to_S_UPDATE', function(data) {
    console.log("[main.js] " + 'C_to_S_UPDATE');
//    console.log("[main.js] data.booksOne  = " + JSON.stringify(data.booksOne));
//    console.log("[main.js] data.booksMany = " + JSON.stringify(data.booksMany));

    let ret = true;

    g_arrayObjBooksOne.forEach(function(value, index, array) {
      let jsonObj = value.get();

      for(let cur of data.booksOne) {
        if(cur._id == jsonObj._id && (cur.gid != jsonObj.gid || cur.email != jsonObj.email)) {
          if(cur.comment.match(/禁持出/)) {
            ret = false;
          } else {
            ret = true;

            if(cur.gid == "" || cur.email == "") {
              array[index].returnBook();
            } else {
              array[index].rentBook(cur.gid, cur.email);
            }
          }
        }
      }
    });

    g_arrayObjBooksMany.forEach(function(value, index, array) {
      let jsonObj = value.get();

      for(let cur of data.booksMany) {
        if(cur._id == jsonObj._id && (cur.gid != jsonObj.gid || cur.email != jsonObj.email)) {
          if(cur.comment.match(/禁持出/)) {
            ret = false;
          } else {
            ret = true;

            if(cur.gid == "" || cur.email == "") {
              array[index].returnBook();
            } else {
              array[index].rentBook(cur.gid, cur.email);
            }
          }
        }
      }
    });

    let one = new Array();
    for(let value of g_arrayObjBooksOne) {
      one.push(value.get());
    }

    let many = new Array();
    for(let value of g_arrayObjBooksMany) {
      many.push(value.get());
    }

    io.sockets.emit('S_to_C_UPDATE_DONE', {ret: ret, booksOne: one, booksMany: many});
  });


});


/**
 * 残日数を取得する
 * @param {number} offset - "2018-09-06" のような形式の文字列
 * @return {string} day - 残日数
 * @example
 * getRestDay("2018-09-06");
*/
let getRestDay = function(deadline) {
  console.log("[main.js] getRestDay()");
  let now = new Date();
  let tgday = deadline.replace('-', '/');
  let days = Math.ceil((Date.parse(tgday) - now.getTime()) / (24 * 60 * 60 * 1000));

  console.log("[main.js] now   = " + now);
  console.log("[main.js] tgday = " + tgday);
  console.log("[main.js] days  = " + days);

  return days;
};


/**
 * 数字が 1 桁の場合に 0 埋めで 2 桁にする
 * @param {number} num - 数値
 * @return {number} num - 0 埋めされた 2 桁の数値
 * @example
 * toDoubleDigits(8);
*/
let toDoubleDigits = function(num) {
//  console.log("[main.js] toDoubleDigits()");
//  console.log("[main.js] num = " + num);
  num += '';
  if(num.length === 1) {
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
let yyyymmdd = function(offset) {
//  console.log("[main.js] yyyymmdd()");
  let date = new Date();

  date.setDate(date.getDate() + offset);

  let yyyy = date.getFullYear();
  let mm   = toDoubleDigits(date.getMonth() + 1);
  let dd   = toDoubleDigits(date.getDate());

  let day = yyyy + '-' + mm + '-' + dd;
//  console.log("[main.js] day = " + day);
  return day;
};


/**
 * 現在の時刻を HH:MM:SS 形式で取得する
 * @param {void}
 * @return {string} time - 時刻
 * @example
 * hhmmss();
*/
let hhmmss = function() {
  console.log("[main.js] hhmmss()");
  let date = new Date();

  let hour = toDoubleDigits(date.getHours());
  let min  = toDoubleDigits(date.getMinutes());
  let sec  = toDoubleDigits(date.getSeconds());

  let time = hour + ':' + min + ':' + sec;
  console.log("[main.js] time = " + time);
  return time;
};


