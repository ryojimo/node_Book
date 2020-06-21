/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
let fs      = require('fs');
let AWS     = require('aws-sdk');


/**
 * API class
 * @param {void}
 * @constructor
 * @example
 * let obj = new ApiAws();
*/
class ApiAws {

  constructor(file, region) {
    /**
     * データ
     * @type {string}
    */
    this.accessKey = file;
    this.region = region;

    AWS.config.loadFromPath(file);
    AWS.config.update({region: region});
    this.s3 = new AWS.S3();
  }


  /**
   * バケットの一覧を取得する
   * @return {void}
   * @example
   * getListBuckets();
  */
  getListBuckets() {
    console.log("[ApiAws.js] getListBuckets()");

    this.s3.listBuckets(function(err, data) {
      if (err) {
        console.log("[ApiAws.js] Error", err);
      } else {
        console.log("[ApiAws.js] Success", data.Buckets);
      }
    });
  }


  /**
   * 対象の bucket 内のファイルの一覧リストを取得する
   * @param {string} bucket - upload 先のバケット
   * @param {function} callback - ファイルの一覧リストを取得した後に呼び出すコールバック関数
   * @return {void}
   * @example
   * getListObjects('uz.sensor');
  */
  getListObjects(bucket, callback) {
    console.log("[ApiAws.js] getListObjects()");
    console.log("[ApiAws.js] bucket   = " + bucket);

    var params = {
      Bucket: bucket  // バケット名
    };

    this.s3.listObjects(params, function(err, data) {
      if (err) {
        console.log("[ApiAws.js] Error", err);
      } if (data) {
        console.log("[ApiAws.js] Download Success");
//        console.log("[ApiAws.js] data = " + JSON.stringify(data));

        let array = new Array();

        for(let value of data.Contents) {
          console.log("[ApiAws.js] value.Key = " + value.Key);
          array.push(value.Key);
        }

        if(callback != undefined) {
          callback(array);
        }
      }
    });
  }


  /**
   * バケットを新規作成する
   * @param {string} name - バケット名
   * @return {void}
   * @example
   * createBucket();
  */
  createBucket(name) {
    console.log("[ApiAws.js] createBucket()");
    console.log("[ApiAws.js] name = " + name);

    // Create the parameters for calling createBucket
    var bucketParams = {
      Bucket : name,
      ACL : 'public-read'
    };

    // call S3 to create the bucket
    this.s3.createBucket(bucketParams, function(err, data) {
      if (err) {
        console.log("[ApiAws.js] Error", err);
      } else {
        console.log("[ApiAws.js] Success", data.Location);
      }
    });
  }


  /**
   * ファイルを upload する
   * @param {string} path - 対象のファイルが置かれている PATH
   * @param {string} filename - ファイル名
   * @param {string} bucket - upload 先のバケット
   * @return {void}
   * @example
   * upload('/media/pi/USBDATA/sensor/', '2020-03-08_sensor.txt', 'uz.sensor');
  */
  upload(path, filename, bucket) {
    console.log("[ApiAws.js] upload()");
    console.log("[ApiAws.js] path     = " + path);
    console.log("[ApiAws.js] filename = " + filename);
    console.log("[ApiAws.js] bucket   = " + bucket);

    var params = {
      Bucket: bucket,   // バケット名
      Key: filename     // アップロード後のファイル名
    };
    params.Body = fs.readFileSync(path +  filename);

    this.s3.upload(params, function(err, data) {
      if (err) {
        console.log("[ApiAws.js] Error", err);
      } if (data) {
        console.log("[ApiAws.js] Upload Success", data.Location);
      }
    });
  }


  /**
   * 指定した bucket の指定した filename を download する
   * @param {string} path - ファイルを置く PATH
   * @param {string} filename - ファイル名
   * @param {string} bucket - 対象のバケット
   * @return {void}
   * @example
   * download('/home/pi/workspace/node_Sensor/data/', '2020-03-08_sensor.txt', 'uz.sensor');
  */
  download(path, filename, bucket) {
    console.log("[ApiAws.js] download()");
    console.log("[ApiAws.js] path     = " + path);
    console.log("[ApiAws.js] filename = " + filename);
    console.log("[ApiAws.js] bucket   = " + bucket);

    var params = {
      Bucket: bucket,   // バケット名
      Key: filename     // ダウンロード後のファイル名
    };

    this.s3.getObject(params, function(err, data) {
      if (err) {
        console.log("[ApiAws.js] Error", err);
      } if (data) {
        console.log("[ApiAws.js] Download Success");
        fs.writeFileSync(path + filename, data.Body.toString());
      }
    });
  }


};


module.exports = ApiAws;


