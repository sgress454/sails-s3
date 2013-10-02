/**
 * Module dependencies
 */

var _			= require('lodash'),
	S3Bucket	= require('./S3Bucket');


module.exports = BatchContext;

/**
 * Context for batch file uploads
 *
 * @param {Stream} incomingBatch - incoming stream of files
 */
function BatchContext( incomingBatch, options, cb ) {


	/**
	 * Triggered after the last file is received from `incomingBatch`
	 * or `incomingBatch` emits an error
	 */
	incomingBatch.once( 'end', function noMoreFiles (err) {

		if (err) {

			// TODO:
			// If the incomingBatch is rejected, use this.files to lookup 
			// and undo the writes, deleting the destination file(s) [configurable]
			console.error('Error ::',err,':: occurred in upload stream...');

			return cb(err, incomingBatch.files);
		}

		if ( ! (incomingBatch.files && _.keys(incomingBatch.files).length ) ) {
			console.log('No files received. Closing incomingBatch stream...');
			return cb(null, incomingBatch.files);
		}
		

		console.log('File(s) received and in process! Closing incomingBatch stream...');
		cb(null, incomingBatch.files);
	});



	/**
	 * Receive a paused binary stream
	 *
	 * @param {ReadStream} incomingFile - paused binary ReadStream
	 */
	incomingBatch.on( 'data', function onFile ( incomingFile ) {

		// Determine blobName (using `saveAs`) and build path
		var downloadName = incomingFile.filename,
			blobName = options.saveAs(downloadName),
			path = options.pathPrefix + blobName;
		console.log('* ' + downloadName + ' :: Adapter received new file...');

		// Ensure that pathPrefix + blobName doesn't exceed max path length
		if (path.length > options.MAX_PATH) {
			incomingBatch.emit('end', new Error('Path (pathPrefix + filename) too long (' + path.length + ' characters!) :: ' + path));
			return;
		}

		// Ensure that blobName doesn't exceed max filename length
		if (blobName.length > options.MAX_FILENAME) {
			incomingBatch.emit('end', new Error('Filename too long (' + blobName.length + ' characters!) :: ' + blobName));
			return;
		}

		// Create an options object for this particular file upload
		var fileOptions = _.extend({}, options, {
			path: path
		});

		// Instantiate an S3Bucket
		// (this builds the underlying knox client)
		var bucket = new S3Bucket(fileOptions);

		// Update incomingBatch's reference to this file
		// with adapter-specific information
		// Update incomingBatch to include blobName & pathPrefix & url
		var fileRecord = incomingBatch.files[incomingFile._id];
		fileRecord.path = path;
		fileRecord.blobName = blobName;
		fileRecord.pathPrefix = options.pathPrefix;
		fileRecord.url = bucket.url;


		// Pipe file's bytes into an outgoing MPU stream to S3
		// TODO: figure out how to wait until all files are ready before triggering this callback
		// TODO: also find out what sails-local-fs is doing right now
		// TODO: make sure quota limits from uploadStream are actually blocking the continued upload of files to S3
		bucket.upload(incomingFile, function mpuDone (err, file) {
			if (err) {
				// make sure `err instanceof Error`
				if (!err instanceof Error) { err = new Error(err); }

				// TODO:
				// Friendly-ize known errors
				// if (e.code === 'ENOENT' && e.path) {
				// 	e.message = 'Could not write file to ' + e.path;
				// }

				// Emit file error back up the incomingBatch stream
				incomingBatch.emit('end', err);
				return;
			}

			console.log('File finished uploading to S3!');
		});

		// Resume field streams detected so far and replay their buffers
		incomingFile._resume();

		// console.log('* ' + downloadName + ' :: resuming file upload stream...');
	});

}