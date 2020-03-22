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
let schedule = require('node-schedule');
let csv      = require('csvtojson');
require('date-utils');

const ApiAws        = require('./js/ApiAws');
const ApiFileSystem = require('./js/ApiFileSystem');
const DataBook      = require('./js/DataBook');


// Ver. 表示
let now = new Date();
console.log("[main.js] " + now.toFormat("YYYY年MM月DD日 HH24時MI分SS秒").rainbow);
console.log("[main.js] " + "ver.01 : app.js".rainbow);

// サーバー・オブジェクトを生成
let server = http.createServer();

// request イベント処理関数をセット
server.on('request', doRequest);

// 待ち受けスタート
const PORT = 4002;
server.listen(process.env.VMC_APP_PORT || PORT);
console.log("[main.js] access to http://localhost:" + PORT);
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
let g_apiAws        = new ApiAws();
let g_apiFileSystem = new ApiFileSystem();

let g_jsonBooksOne  = null;
let g_jsonBooksMany = null;
let g_jsonBooksRent = new Array();

let g_arrayObjBooksOne  = new Array();
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

  // bucket 'uz.book.rent' を新規作成する
  // g_apiAws.createBucket('uz.book.rent');

  // AWS から書籍一覧の csv ファイルを取得する
  g_apiAws.download('/home/pi/workspace/node_Book/data/', 'BT_books_one.csv', 'uz.book');
  g_apiAws.download('/home/pi/workspace/node_Book/data/', 'BT_books_many.csv', 'uz.book');

  // AWS から貸し出したことのある書籍の json ファイルをすべて取得する
  g_apiAws.getListObjects('uz.book.rent', function(array) {
    for(let value of array) {
      console.log("[ApiAws.js] value = " + value);
      g_apiAws.download('/home/pi/workspace/node_Book/data/rent/', value, 'uz.book.rent');
    }
  });

  // 書籍一覧の csv ファイルを読み出して json 形式の配列データを取得する
  setTimeout(setBooksOne,  1000);  // AWS からファイルを取得するのに時間がかかるので 1000ms 待機して setBooksOne() を実行
  setTimeout(setBooksMany, 1100);  // AWS からファイルを取得するのに時間がかかるので 1100ms 待機して setBooksMany() を実行

  // 貸出状態になっている本の全情報の json 形式の配列データを取得する
  setTimeout(setBooksRent, 1200);  // AWS からファイルを取得するのに時間がかかるので 1200ms 待機して setBooksRent() を実行
};


/**
 * csv ファイルを読み出して json 形式の配列データを取得する
 * @param {void}
 * @return {void}
 * @example
 * setBooksOne();
*/
function setBooksOne() {
  console.log("[main.js] setBooksOne()");
  csv().fromFile('./data/BT_books_one.csv').then((jsonObj)=> {
//    console.log("[main.js] jsonObj = " + JSON.stringify(jsonObj));
    g_jsonBooksOne = jsonObj;
  });
}


/**
 * csv ファイルを読み出して json 形式の配列データを取得する
 * @param {void}
 * @return {void}
 * @example
 * setBooksMany();
*/
function setBooksMany() {
  console.log("[main.js] setBooksMany()");
  csv().fromFile('./data/BT_books_many.csv').then((jsonObj)=> {
//    console.log("[main.js] jsonObj = " + JSON.stringify(jsonObj));
    g_jsonBooksMany = jsonObj;
  });
}


/**
 * 貸出状態になったことがある本の json 形式の配列データを取得する
 * @param {void}
 * @return {void}
 * @example
 * setBooksRent();
*/
function setBooksRent() {
  console.log("[main.js] setBooksRent()");
  let ret = null;
  let jsonObj = null;

  let filenames = fs.readdirSync('/media/pi/USBDATA/book/');
  console.log("[main.js] filenames = " + filenames);
  try {
    for(let value of filenames) {
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
}


/**
 * json を DataBook オブジェクト配列にセットする
 * @param {object} json - 書籍情報の json 形式の配列データ
 * @param {object} array - DataBook オブジェクトの配列
 * @return {void}
 * @example
 * setArrayBooks(g_jsonBooksOne, g_arrayObjBooksOne);
*/
function setArrayBooks(json, array) {
  console.log("[main.js] setArrayBooks()");
  if(json != null && array.length == 0) {
    for(let value of json) {
      let obj = new DataBook(value);
      array.push(obj);
    }
  }
}


/**
 * 貸出済みのデータがあれば、g_arrayObjBooksOne, g_arrayObjBooksMany の内容を更新する
 * @param {object} array - DataBook オブジェクトの配列
 * @return {void}
 * @example
 * updateArrayBooks();
*/
function updateArrayBooks(array) {
  console.log("[main.js] updateArrayBooks()");
  for(let value of array) {
    let jsonObj = value.get();

    for(let br of g_arrayObjBooksRent) {
      let jsonRent = br.get();
      if(jsonObj._id == jsonRent._id) {
        value.set(jsonRent);
      }
    }
  }
}


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
    setArrayBooks(g_jsonBooksOne, g_arrayObjBooksOne);
    setArrayBooks(g_jsonBooksMany, g_arrayObjBooksMany);
    setArrayBooks(g_jsonBooksRent, g_arrayObjBooksRent);

    // 既に貸出済みのデータがあれば、g_arrayObjBooksOne, g_arrayObjBooksMany の内容を更新する
    updateArrayBooks(g_arrayObjBooksOne);
    updateArrayBooks(g_arrayObjBooksMany);

    // DataBook オブジェクト配列から、json データの配列を生成する
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
      ret = update(value, index, array, data.booksOne);
    });

    g_arrayObjBooksMany.forEach(function(value, index, array) {
      ret = update(value, index, array, data.booksMany);
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
 * 更新する。
 * @param {object} value - DataBook オブジェクト
 * @param {number} index - array のインデックス番号
 * @param {object} array - DataBook オブジェクトの配列
 * @param {object} target - 対象の JSON オブジェクト
 * @return {boolean} ret - 成功時: true, 失敗時: false を返す。
 * @example
 * update("2018-09-06");
*/
function update(value, index, array, target) {
//  console.log("[main.js] update()");
  let jsonObj = value.get();
  let ret = true;

  for(let cur of target) {
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

        let info = array[index].get();
        let filename = '/media/pi/USBDATA/book/' + info._id + '.json';
        g_apiFileSystem.write(filename, info);
      }
    }
  }

  return ret;
};


