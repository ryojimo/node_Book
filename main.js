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
let g_path_top = '/home/pi/workspace/node_Book/';
//let g_path_top = '/home/ec2-user/workspace/node_Book/';
let g_aws_key    = './data/aws_rootkey_bt.json';
let g_aws_region = 'ap-northeast-1';
let g_aws_s3     = 'uz.book.2020';

let g_apiAws        = new ApiAws(g_aws_key, g_aws_region);
let g_apiFileSystem = new ApiFileSystem();

let g_jsonOne  = null;
let g_jsonMany = null;
let g_jsonRent = new Array();

let g_arrayObjOne  = new Array();
let g_arrayObjMany = new Array();
let g_arrayObjRent = new Array();


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

  // bucket 'uz.book.2020' を新規作成する
  // g_apiAws.createBucket(g_aws_s3);

  // AWS からブック一覧の csv ファイルを取得する
  g_apiAws.download(g_path_top + 'data/', 'BT_books_one.csv', g_aws_s3);
  g_apiAws.download(g_path_top + 'data/', 'BT_books_many.csv', g_aws_s3);

  // ブック一覧の csv ファイルを読み出して json 形式の配列データを取得する
  setTimeout(setOne,  1000);  // AWS からファイルを取得するのに時間がかかるので 1000ms 待機して setOne() を実行
  setTimeout(setMany, 1100);  // AWS からファイルを取得するのに時間がかかるので 1100ms 待機して setMany() を実行
};


/**
 * csv ファイルを読み出して json 形式の配列データを取得する
 * @param {void}
 * @return {void}
 * @example
 * setOne();
*/
function setOne() {
  console.log("[main.js] setOne()");
  csv().fromFile('./data/BT_books_one.csv').then((jsonObj)=> {
//    console.log("[main.js] jsonObj = " + JSON.stringify(jsonObj));
    g_jsonOne = jsonObj;
  });
}


/**
 * csv ファイルを読み出して json 形式の配列データを取得する
 * @param {void}
 * @return {void}
 * @example
 * setMany();
*/
function setMany() {
  console.log("[main.js] setMany()");
  csv().fromFile('./data/BT_books_many.csv').then((jsonObj)=> {
//    console.log("[main.js] jsonObj = " + JSON.stringify(jsonObj));
    g_jsonMany = jsonObj;
  });
}


/**
 * 貸出状態になったことがある本の json 形式の配列データを取得する
 * @param {void}
 * @return {void}
 * @example
 * setRent();
*/
function setRent() {
  console.log("[main.js] setRent()");
  let ret = null;
  let jsonObj = null;

  let filenames = fs.readdirSync(g_path_top + 'data/rent/');
  console.log("[main.js] filenames = " + filenames);
  try {
    for(let value of filenames) {
      let file = g_path_top + 'data/rent/' + value;
//      console.log("[main.js] file = " + file);

      fs.statSync(file);
      ret = fs.readFileSync(file, 'utf8');
      jsonObj = (new Function("return " + ret))();
      g_jsonRent.push(jsonObj);
    }

//    console.log("[main.js] g_jsonRent = " + JSON.stringify(g_jsonRent));
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
 * @param {object} json - ブック情報の json 形式の配列データ
 * @param {object} array - DataBook オブジェクトの配列
 * @return {void}
 * @example
 * setArrayBook(g_jsonOne, g_arrayObjOne);
*/
function setArrayBook(json, array) {
  console.log("[main.js] setArrayBook()");
  if(json != null && array.length == 0) {
    for(let value of json) {
      let obj = new DataBook(value);
      array.push(obj);
    }
  }
}


/**
 * 貸出済みのデータがあれば、g_arrayObjOne, g_arrayObjMany の内容を更新する
 * @param {object} array - DataBook オブジェクトの配列
 * @return {void}
 * @example
 * updateArrayBook(g_arrayObjOne);
*/
function updateArrayBook(array) {
  console.log("[main.js] updateArrayBook()");
  for(let value of array) {
    let jsonObj = value.get();

    for(let br of g_arrayObjRent) {
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

    // 貸出状態になっている本の全情報の json 形式の配列データを取得する
    setRent();

    // Array オブジェクトに DataBook オブジェクトをセット
    setArrayBook(g_jsonOne, g_arrayObjOne);
    setArrayBook(g_jsonMany, g_arrayObjMany);
    setArrayBook(g_jsonRent, g_arrayObjRent);

    // 既に貸出済みのデータがあれば、g_arrayObjOne, g_arrayObjMany の内容を更新する
    updateArrayBook(g_arrayObjOne);
    updateArrayBook(g_arrayObjMany);

    // DataBook オブジェクト配列から、json データの配列を生成する
    let one = new Array();
    let many = new Array();

    for(let value of g_arrayObjOne) {
      one.push(value.get());
    }

    for(let value of g_arrayObjMany) {
      many.push(value.get());
    }

    console.log("[main.js] g_arrayObjOne.length  = " + g_arrayObjOne.length);
    console.log("[main.js] g_arrayObjMany.length = " + g_arrayObjMany.length);
    io.sockets.emit('S_to_C_INIT_DONE', {one: one, many: many});
  });


  socket.on('C_to_S_UPDATE', function(data) {
    console.log("[main.js] " + 'C_to_S_UPDATE');
//    console.log("[main.js] data.one  = " + JSON.stringify(data.one));
//    console.log("[main.js] data.many = " + JSON.stringify(data.many));

    let ret = true;

    g_arrayObjOne.forEach(function(value, index, array) {
      ret = update(value, index, array, data.one);
    });

    g_arrayObjMany.forEach(function(value, index, array) {
      ret = update(value, index, array, data.many);
    });

    let one = new Array();
    for(let value of g_arrayObjOne) {
      one.push(value.get());
    }

    let many = new Array();
    for(let value of g_arrayObjMany) {
      many.push(value.get());
    }

    io.sockets.emit('S_to_C_UPDATE_DONE', {ret: ret, one: one, many: many});
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
          array[index].dropOff();
        } else {
          array[index].rent(cur.gid, cur.email);
        }

        let info = array[index].get();
        let filename = g_path_top + 'data/rent/' + info._id + '.json';
        g_apiFileSystem.write(filename, info);
      }
    }
  }

  return ret;
};


