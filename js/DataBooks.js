/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
var fs = require( 'fs' );
var MongoClient  = require( 'mongodb' ).MongoClient;
var ObjectID = require('mongodb').ObjectID;

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
 * 指定した MongoDB コレクション名の全ドキュメントを取得する。
 * @param {string} collection - 対象の MongoDB コレクション名
 * @param {function(boolean, Object)} callback - データを取得するためのコールバック関数
 * @return {void}
 * @example
 * GetAllDocs( 'one_2018_09'. callback );
*/
DataBooks.prototype.GetAllDocs = function( collection, callback ){
  console.log( "[DataBooks.js] GetAllDocs()" );
  console.log( "[DataBooks.js] collection = " + collection );

  MongoClient.connect( this.mongo_url, function(err, db) {
    if( err ) throw err;

    // データベースを取得する
    var dbo = db.db( 'books' );

    // コレクションを取得する
    var clo = dbo.collection( collection );

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
        callback( true, documents );
      }
      catch( e ){
        console.log( "[DataBooks.js] e = " + e );
        callback( false, documents );
      }
    });
  });
}


/**
 * コレクションに含まれる全ドキュメントに対して query を問い合わせる
 * @param {string} collection - 対象の MongoDB コレクション名
 * @param {Object} query - JSON 文字列
 * @param {function(boolean, Object)} callback - データを取得するためのコールバック関数
 * @return {void}
 * @example
 * Query( 'one_2018_09', {'gid': 0000114347}, function( err, doc ){} );
*/
DataBooks.prototype.Query = function( collection, query, callback ){
  console.log( "[DataBooks.js] Query()" );
  console.log( "[DataBooks.js] collection = " + collection );
  console.log( "[DataBooks.js] query      = " + JSON.stringify(query) );

  MongoClient.connect( this.mongo_url, function(err, db) {
    if( err ){
      throw err;
    }

    // データベースを取得する
    var dbo = db.db( 'books' );

    // コレクションを取得する
    var clo = dbo.collection( collection );

    clo.find( query ).toArray( function(err, documents){
      try{
        if (err){
          throw err;
        } else {
          db.close();
          console.log( "[DataBooks.js] documents.length = " + documents.length );
          console.log( "[DataBooks.js] documents        = " + JSON.stringify(documents) );
          callback( true, documents );
        }
      }
      catch( e ){
        console.log( "[DataBooks.js] e = " + e );
        callback( false, documents );
      }
    });
  });
}


/**
 * 指定した MongoDB コレクション名の指定したドキュメントを更新する。
 * @param {string} collection - 対象の MongoDB コレクション名
 * @param {string} id - 対象の MongoDB のドキュメント ID
 * @param {Object} data - 新しいデータ
 * @return {void}
 * @example
 * UpdateDoc( 'one_2018_09', '', {} );
*/
DataBooks.prototype.UpdateDoc = function( collection, id, data ){
  console.log( "[DataBooks.js] UpdateDoc()" );
  console.log( "[DataBooks.js] collection = " + collection );
  console.log( "[DataBooks.js] id = " + id );
  console.log( "[DataBooks.js] data = " + JSON.stringify(data) );

  MongoClient.connect( this.mongo_url, function(err, db) {
    if( err ){
      throw err;
    }

    // データベースを取得する
    var dbo = db.db( 'books' );

    // コレクションを取得する
    var clo = dbo.collection( collection );

    var query = {'_id':ObjectID(id)};
    var newvalues = { $set: {status   : data.status,
                             gid      : data.gid,
                             user_name: data.user_name,
                             date     : data.date,
                             deadline : data.deadline,
                             progress : data.progress,
                             rating   : data.rating,
                             count    : data.count,
                             comment  : data.comment}
                    };

  console.log( "[DataBooks.js] newvalues = " + JSON.stringify(newvalues) );

    // doc をデータベースに insert する
    clo.updateOne( query, newvalues, function(err, res) {
      if( err ){
        throw err;
      }
      db.close();
    });
  });
}


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


