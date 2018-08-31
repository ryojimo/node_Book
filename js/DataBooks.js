/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
var fs = require( 'fs' );
var MongoClient  = require( 'mongodb' ).MongoClient;


/**
 * データ class
 * @param {void}
 * @constructor
 * @example
 * var obj = new DataBooks();
*/
var DataBooks = function(){
  /**
   * MongoDB のデータベース名
   * @type {string}
  */
  this.nameDatabase = 'books';

  /**
   * MongoDB の URL
   * @type {string}
  */
  this.mongo_url = 'mongodb://localhost:27017/';
};


/**
 * Mongodb にデータベース、コレクション、ドキュメントを作成する。
 * @param {string} day - 日付。( MongoDB のコレクション名でも使用 )
 * @param {string} hour - 時間。
 * @param {number} cnt - 訪問者数カウンタ。
 * @return {void}
 * @example
 * CreateMDDoc( "2018-08-10", "08:00" );
*/
DataBooks.prototype.CreateMDDoc = function( day, hour ){
  console.log( "[DataBooks.js] CreateMDDoc()" );

  var doc = { hour: hour, cnt: this.cnt };

  MongoClient.connect( this.mongo_url, function(err, db) {
    if( err ){
      throw err;
    }

    // データベースを取得する
    var dbo = db.db( 'books' );

    // コレクションを取得する
    var clo = dbo.collection( day );

    // doc をデータベースに insert する
    clo.insertOne( doc, function(err, res) {
      if( err ){
        throw err;
      }
      db.close();
    });
  });
}


/**
 * 指定した日付の訪問者数情報を取得する。
 * @param {string} day - 対象の日付。( MongoDB のコレクション名でも使用 )
 * @param {function(boolean, Object.<string, number>)} callback - データを取得するためのコールバック関数
 * @return {void}
 * @example
 * GetMDDocData( callback );
*/
DataBooks.prototype.GetMDDocData = function( callback ){
  console.log( "[DataBooks.js] GetMDDocData()" );

  MongoClient.connect( this.mongo_url, function(err, db) {
    if( err ) throw err;

    // データベースを取得する
    var dbo = db.db( 'books' );

    // コレクションを取得する
    var clo = dbo.collection( "2018_08" );

    // コレクションに含まれるすべてのドキュメントを取得する
    clo.find({}).toArray( function(err, documents){
      try{
        if( err ){
          throw err;
        }

        var len = documents.length;
        console.log( "[DataBooks.js] len = " + len );

        db.close();

//      console.log( documents );
        callback( ret, documents );
      }
      catch( e ){
        console.log( "[DataBooks.js] e = " + e );
        callback( false, documents );
      }
    });
  });
}




/**
 * 引数の file からデータを読み出して dataOneDay プロパティを更新する。
 * @param {string} file - 対象のファイル ( フルパス )
 * @return {Object} ret - 読み出したデータ
 * @example
 * var obj = UpdateDataOneDay( '/media/pi/USBDATA/2018-01-23_room.txt' );
*/
DataBooks.prototype.UpdateDataOneDay = function( file ){
  console.log( "[DataBooks.js] UpdateDataOneDay()" );
  console.log( "[DataBooks.js] file = " + file );

  var date = file.replace( '/media/pi/USBDATA/', '' );
  date = date.replace( '_room.txt', '' );

  this.date = date;
  console.log( "[DataBooks.js] this.date = " + this.date );

  var ret = false;
  try{
    fs.statSync( file );
    var ret = fs.readFileSync( file, 'utf8');
    var obj = (new Function("return " + ret))();

    for( var key in this.dataOneDay ){
      this.dataOneDay[key] = obj[key];
    }
    console.log( '[DataBooks.js] this.dataOneDay = ' + JSON.stringify(this.dataOneDay) );
  } catch( err ){
    if( err.code === 'ENOENT' ){
      console.log( "[DataBooks.js] file does not exist." );
      for( var key in this.dataOneDay ){
        this.dataOneDay[key] = 0;
      }
      ret = false
    }
  }
  return ret;
};


/**
 * 数字が 1 桁の場合に 0 埋めで 2 桁にする
 * @param {number} num - 数値
 * @return {number} num - 0 埋めされた 2 桁の数値
 * @example
 * toDoubleDigits( 8 );
*/
var toDoubleDigits = function( num ){
  console.log( "[DataBooks.js] toDoubleDigits()" );
  console.log( "[DataBooks.js] num = " + num );
  num += '';
  if( num.length === 1 ){
    num = '0' + num;
  }
  return num;
};


module.exports = DataBooks;


