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

  constructor() {
    /**
     * データ
     * @type {string}
    */
    this.accessKey = './data/aws_rootkey.json';
    this.region = 'ap-northeast-1';

    AWS.config.loadFromPath('./data/aws_rootkey.json');
    AWS.config.update({region: 'ap-northeast-1'});
    this.s3 = new AWS.S3();
  }


  /**
   * バケットの一覧を取得する
   * @return {void}
   * @example
   * getList();
  */
  getList() {
    console.log("[Aws.js] getList()");

    this.s3.listBuckets(function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data.Buckets);
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
    console.log("[Aws.js] createBucket()");
    console.log("[Aws.js] name = " + name);

    // Create the parameters for calling createBucket
    var bucketParams = {
      Bucket : name,
      ACL : 'public-read'
    };

    // call S3 to create the bucket
    this.s3.createBucket(bucketParams, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data.Location);
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
    console.log("[Aws.js] upload()");
    console.log("[Aws.js] path     = " + path);
    console.log("[Aws.js] filename = " + filename);
    console.log("[Aws.js] bucket   = " + bucket);

    var params = {
      Bucket: bucket,   // バケット名
      Key: filename     // アップロード後のファイル名
    };
    params.Body = fs.readFileSync(path +  filename);

    this.s3.upload(params, function(err, data) {
      if (err) {
        console.log("Error", err);
      } if (data) {
        console.log("Upload Success", data.Location);
      }
    });
  }


  /**
   * ファイルを download する
   * @param {string} path - 対象のファイルが置かれている PATH
   * @param {string} filename - ファイル名
   * @param {string} bucket - upload 先のバケット
   * @return {void}
   * @example
   * download('/home/pi/workspace/node_Sensor/data/', '2020-03-08_sensor.txt', 'uz.sensor');
  */
  download(path, filename, bucket) {
    console.log("[Aws.js] download()");
    console.log("[Aws.js] path     = " + path);
    console.log("[Aws.js] filename = " + filename);
    console.log("[Aws.js] bucket   = " + bucket);

    var params = {
      Bucket: bucket,   // バケット名
      Key: filename     // ダウンロード後のファイル名
    };

    this.s3.getObject(params, function(err, data) {
      if (err) {
        console.log("Error", err);
      } if (data) {
        console.log("Download Success");
        fs.writeFileSync(path + filename, data.Body.toString());
      }
    });
  }


};


module.exports = ApiAws;


