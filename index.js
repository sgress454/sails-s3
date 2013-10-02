/**
 * Module dependencies
 */

var _			= require('lodash'),
	knox		= require('knox'),
	BlobFactory	= require('waterline-blob');	// TODO: merge `waterline-blob` into waterline core


/*---------------------------------------------------------------
	:: S3 Adapter
	:: sails-s3
	::
	
	Upload and download stuff from Amazon S3 with Waterline/Sails

---------------------------------------------------------------*/
module.exports = (function () {

	// Constants
	var MAX_PATH = 260,
		MAX_FILENAME = 255;
	

	return BlobFactory({

		registerCollection: function (collection, cb) {

			console.log('-->',collection);
			cb();
			// var client = knox.createClient({
			// 	key: '<api-key-here>',
			// 	secret: '<secret-here>',
			// 	bucket: 'learnboost'
			// });
		},


		/**
		 * Read from provided uploadStream and write to blob store
		 */

		write: function  ( uploadStream, options, cb ) {
			return cb (new Error('Not supported yet!'));

			// Grab a logger (use sails.log if available)
			var log = typeof sails !== 'undefined' ? sails.log : {
				verbose: console.log,
				warn: console.warn,
				error: console.error
			};

			// When the uploadStream ends or errors, trigger the callback
			uploadStream.once('end', function noMoreFiles (err) {

				if (err) {

					// TODO:
					// If the uploadStream is rejected, use this.files to lookup 
					// and undo the writes, deleting the destination file(s) [configurable]
					log.error('Error ::',err,':: occurred in upload stream...');
					cb(err, uploadStream.files);
					return;
				}

				if ( ! (uploadStream.files && _.keys(uploadStream.files).length ) ) {
					log.verbose('No files specified! Closing stream...');
				}
				else log.verbose('Upload successful! Closing stream...');

				cb(null, uploadStream.files);
			});


			// Listen to upload stream for new files
			// Receive each upload as a paused field stream
			uploadStream.on('data', function receiveNewFile (pausedBinaryStream) {

				// Determine blobName (using `saveAs`)
				// Then build path
				var downloadName = pausedBinaryStream.filename;
				var blobName = options.saveAs(downloadName);
				var path = options.container + blobName;

				// Ensure that container + blobName doesn't exceed max path length
				if (path.length > MAX_PATH) {
					uploadStream.emit('end', new Error('Path (container + filename) too long (' + path.length + ' characters!) :: ' + path));
					return;
				}

				// Ensure that blobName doesn't exceed max filename length
				if (blobName.length > MAX_FILENAME) {
					uploadStream.emit('end', new Error('Filename too long (' + blobName.length + ' characters!) :: ' + blobName));
					return;
				}
				
				// Build full path and open writestream for this file
				var destinationStream = fs.createWriteStream( path );
				
				// Handle errors writing thru adapter
				// (e.g. destination path does not exist)
				destinationStream.on('error', function onWriteError ( e ) {
					// `e instanceof Error`

					// Friendly-ize known errors
					if (e.code === 'ENOENT' && e.path) {
						e.message = 'Could not write file to ' + e.path;
					}

					// Emit errors back up the uploadStream
					uploadStream.emit('end', e);
					return;
				});

				// Update uploadStream's reference to this file
				// with adapter-specific information
				var fileRecord = uploadStream.files[pausedBinaryStream._id];
				fileRecord.path = path;

				// Update uploadStream to include blobName
				fileRecord.blobName = blobName;
				fileRecord.container = options.container;

				log.verbose('* ' + downloadName + ' :: Adapter received new file...');
				log.verbose('* Wrote to disk as ' + blobName + '...');
				
				// Hook up the data events from the field streams 
				// to the destination stream
				pausedBinaryStream.pipe(destinationStream);
				
				// Resume field streams detected so far 
				// and replay their buffers
				log.verbose('* ' + downloadName + ' :: resuming stream...');
				pausedBinaryStream._resume();
			});
		},



		/**
		 * Read from blob store and write to specified download stream
		 */

		read: function ( downloadStream, options, cb ) {
			return cb (new Error('Not supported yet!'));

			// Grab a logger (use sails.log if available)
			var log = typeof sails !== 'undefined' ? sails.log : {
				verbose: console.log,
				warn: console.warn,
				error: console.error
			};

			// Makes callback optional, 
			// and limits it to only fire once just in case
			cb = cb ? _.once(cb) : function noopCb () {};
			
			var splat = options.container + '/' + options.filename;
			log.verbose('LocalDiskAdapter.read files from ' + splat);

			// apply splat expression e.g. `.tmp/uploads/*` and return a set
			var globtions = {};

			// Start glob stream
			var glob = new Glob (splat, globtions);

			// Handle end of the stream and errors
			glob.once('abort', function globAborted () {
				downloadStream.emit('glob_abort');
				cb();
			});
			glob.once('end', function globDone (matches) {
				downloadStream.emit('glob_done', matches);
				cb(null, matches);
			});
			glob.once('error', function globError (err) {
				err = err || new Error();
				downloadStream.emit('glob_error', err);
				cb(err);
			});
			
			// Acquire source stream(s) one by one
			// as files come in from glob
			glob.on('match', function globMatch (path) {
				log.verbose('Found file @', path);

				// Pass byte stream to download stream
				var pausedStream = fs.createReadStream(path, {
					encoding: options.encoding
				});

				// Start buffering bytes that arrive
				// pausedStream.pause();

				// Figure out file name and save reference as `filename`
				pausedStream.filename = pausedStream.path.match(/\/([^/]+)\/?$/)[1];

				// Notify downloadStream that a new file has come in
				downloadStream.emit('file', pausedStream);
			});

			// return destination stream
			return downloadStream;
		}
	});

})();



