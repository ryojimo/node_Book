/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
require('date-utils');

const ApiCmn = require('./ApiCmn');
let g_apiCmn = new ApiCmn();


const MAX_DATE = 14;


/**
 * データ class
 * @param {void}
 * @constructor
 * @example
 * let obj = new DataBook(jsonObj);
*/
class DataBook {

  constructor(jsonObj) {
    this.data = {
      status: false,      // @type {bool}   : 貸出状態。貸し出されると true にセット。
      gid: "",            // @type {string} : 現在借りている人の Global ID
      email: "",          // @type {string} : 現在借りている人の email アドレス
      date: "",           // @type {string} : 貸出日
      deadline: "",       // @type {string} : 返却期限の日にち
      progress: 0,        // @type {number} : 残日数
      rating: 0,          // @type {number} : 人気度 
      count: 0,           // @type {number} : 貸し出された回数
      _id: "",            // @type {string} : ID
      title: "",          // @type {string} : タイトル
      author: "",         // @type {string} : 著者
      publisher: "",      // @type {string} : 出版社
      first_edition: "",  // @type {string} : 初版の日にち
      ISBN: "",           // @type {string} : ISBN
      language: "",       // @type {string} : 書かれている言語
      category: "",       // @type {string} : カテゴリ
      publication: "",    // @type {string} : 出版形態
      comment: "",        // @type {string} : 備考
    };

    this.data = jsonObj;
  }


  /**
   * this.data を取得する。
   * @param {void}
   * @return {object} - this.data
   * @example
   * get();
  */
  get() {
    return this.data;
  }


  /**
   * this.data に値をセットする。
   * @param {object} - セットする json 形式のデータ
   * @return {void}
   * @example
   * set();
  */
  set(jsonObj) {
    this.data = jsonObj;
  }


  /**
   * 貸出状態 (status = true) にして <_id>.txt ファイルに書き込む。
   * @param {number} gid - global ID
   * @param {string} email - email address
   * @return {void}
   * @example
   * rentBook('0000114347', ****@gmail.com);
  */
  rent(gid, email) {
    console.log("[DataBook.js] rent()");
    console.log("[DataBook.js] gid = " + gid);
    console.log("[DataBook.js] email = " + email);

    this.data.status = true;
    this.data.gid = gid;
    this.data.email = email;
    this.data.date = g_apiCmn.yyyymmdd();
    this.data.deadline = g_apiCmn.yyyymmdd(MAX_DATE);
    this.data.progress = MAX_DATE;
    this.data.count++;
  }


  /**
   * 返却状態 (status = false) にして <_id>.txt ファイルに書き込む。
   * @param {void}
   * @return {void}
   * @example
   * dropOff();
  */
  dropOff() {
    console.log("[DataBook.js] dropOff()");

    this.data.status = false;
    this.data.gid = "";
    this.data.email = "";
    this.data.date = "";
    this.data.deadline = "";
    this.data.progress = 0;
  }


  /**
   * this.data.progress を更新する。
   * @param {void}
   * @return {void}
   * @example
   * update();
  */
  update() {
    console.log("[DataBook.js] update()");

    this.data.progress--;
  }


};


module.exports = DataBook;


