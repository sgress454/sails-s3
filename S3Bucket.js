/**
 * Module dependencies
 */

var _			= require('lodash'),
	knox		= require('knox'),
	S3MPU		= require('knox-mpu'),
	S3Glob		= require('s3-lister');

/**
 * S3 Bucket
 */
function S3Bucket (options) {
	_.extend(this, options);

	this.s3Client = knox.createClient({
		key		: options.key,
		secret	: options.secret,
		bucket	: options.bucket
	});
}



/**
 * Upload a multipart file to S3 w/o knowing the Content-length ahead of time
 *
 * @param {Stream} incomingStream
 * @param {Function} cb
 *		@param {Error} err
 *		@param {Object} body - containing Location, Bucket, Key, ETag and size of the object
 */
S3Bucket.prototype.upload = function (incomingStream, cb) {

	// console.log('knox client :: ', this.s3Client);
	// console.log('path :: ', this.path);
	
	// Create a multipart file upload
	// (implicitly, this uploads each part as a different file to S3, then unifies them later)
	new S3MPU({
		client: this.s3Client,
		objectName: this.path,
		stream: incomingStream
	}, function multipartUploadComplete (err, body) {
		if (err) return cb(err);
		// 
		/*
		  {
		      Location: 'http://Example-Bucket.s3.amazonaws.com/destination.txt',
		      Bucket: 'Example-Bucket',
		      Key: 'destination.txt',
		      ETag: '"3858f62230ac3c915f300c664312c11f-9"',
		      size: 7242880
		  }
		*/

		// Map result
		return cb(null, {
			url: body.Location,
			size: body.size,
			blobName: body.Key,
			etag: body.ETag,
			bucket: body.bucket
		});
	});
};



/**
 * Do an `ls` on an S3 bucket using the specified path prefix
 */
S3Bucket.prototype.glob = function (prefix) {

	// sanitize prefix
	// should be like:
	// prefix : 'logs/api/a0z4'
	
	// var lister = new S3Glob(this.s3Client, {
	// 	prefix: prefix
	// });

	// lister
	// 	.on('data',  function (data) { console.log(data.Key); })
	// 	.on('error', function (err)  { console.log('Error!', err); })
	// 	.on('end',   function ()     { console.log('Done!'); });
};



/**
 * Export S3Bucket constructor
 */
module.exports = S3Bucket;