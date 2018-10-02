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
 * 対象の collection の全ドキュメントを取得する。
 * @param {string} collection - 対象の MongoDB コレクション
 * @param {function(boolean, Object)} callback - データを取得するためのコールバック関数
 * @return {void}
 * @example
 * getAllDocs( 'one_2018_09', callback );
*/
DataBooks.prototype.getAllDocs = function( collection, callback ){
  console.log( "[DataBooks.js] getAllDocs()" );
  console.log( "[DataBooks.js] collection = " + collection );

  MongoClient.connect( this.mongo_url, function(err, db){
    if( err ) throw err;

    var dbo = db.db( 'books' );             // データベースを取得する
    var clo = dbo.collection( collection ); // コレクションを取得する

    // コレクションに含まれるすべてのドキュメントを取得する
    clo.find( {} ).toArray( function(err, docs){
      try{
        if( err ) throw err;

        db.close();
        console.log( "[DataBooks.js] docs.length = " + docs.length );
//        console.log( "[DataBooks.js] docs        = " + JSON.stringify(docs) );
        callback( true, docs );
      }
      catch( e ){
        console.log( "[DataBooks.js] e = " + e + " : " + e.message );
        db.close();
        callback( false, docs );
      }
    });
  });
}


/**
 * 対象の collection の全ドキュメントに対して query に一致するドキュメントを問い合わせる。
 * @param {string} collection - 対象の MongoDB コレクション
 * @param {Object} query - 問い合わせの情報
 * @param {function(boolean, Object)} callback - データを取得するためのコールバック関数
 * @return {void}
 * @example
 * query( 'one_2018_09', {'gid': 0000114347}, function( err, doc ){} );
*/
DataBooks.prototype.query = function( collection, query, callback ){
  console.log( "[DataBooks.js] query()" );
  console.log( "[DataBooks.js] collection = " + collection );
  console.log( "[DataBooks.js] query      = " + JSON.stringify(query) );

  MongoClient.connect( this.mongo_url, function(err, db) {
    if( err ) throw err;

    var dbo = db.db( 'books' );             // データベースを取得する
    var clo = dbo.collection( collection ); // コレクションを取得する

    clo.find( query ).toArray( function(err, docs){
      try{
        if( err ) throw err;

        db.close();
        console.log( "[DataBooks.js] docs.length = " + docs.length );
//        console.log( "[DataBooks.js] docs        = " + JSON.stringify(docs) );
        callback( true, docs );
      }
      catch( e ){
        console.log( "[DataBooks.js] e = " + e + " : " + e.message );
        db.close();
        callback( false, docs );
      }
    });
  });
}


/**
 * 対象の collection の id で指定したドキュメントを更新する。
 * @param {string} collection - 対象の MongoDB コレクション
 * @param {string} id - 対象の MongoDB ドキュメントの ID
 * @param {Object} data - 新しいデータ
 * @return {void}
 * @example
 * updateDoc( 'one_2018_09', '', {} );
*/
DataBooks.prototype.updateDoc = function( collection, id, data ){
  console.log( "[DataBooks.js] updateDoc()" );
  console.log( "[DataBooks.js] collection = " + collection );
  console.log( "[DataBooks.js] id = " + id );
  console.log( "[DataBooks.js] data = " + JSON.stringify(data) );

  MongoClient.connect( this.mongo_url, function(err, db){
    if( err ) throw err;

    var dbo = db.db( 'books' );             // データベースを取得する
    var clo = dbo.collection( collection ); // コレクションを取得する

    var query = {'_id':ObjectID(id)};
    var newdata = { $set: {status   : data.status,
                             gid      : data.gid,
                             user_name: data.user_name,
                             date     : data.date,
                             deadline : data.deadline,
                             progress : data.progress,
                             rating   : data.rating,
                             count    : data.count,
                             comment  : data.comment}
                    };

    console.log( "[DataBooks.js] newdata = " + JSON.stringify(newdata) );

    // doc をデータベースに insert する
    clo.updateOne( query, newdata, function(err, res){
      try{
        if( err ) throw err;

        db.close();
      }
      catch( e ){
        console.log( "[DataBooks.js] e = " + e + " : " + e.message );
        db.close();
      }
    });
  });
}


module.exports = DataBooks;


