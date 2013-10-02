/**
 * Module dependencies
 */

var _			= require('lodash'),
	Batch		= require('./Batch'),
	BlobFactory	= require('waterline-blob');	// TODO: merge `waterline-blob` into waterline core


/*---------------------------------------------------------------
	:: S3 Adapter
	:: sails-s3
	::
	
	Upload and download stuff from Amazon S3 with Waterline/Sails

---------------------------------------------------------------*/
module.exports = (function () {

	
	// Dictionary of default config for each collection
	// (built automatically on `registerCollection()`)
	var collectionConfs = {};


	// App-wide defaults for this adapter
	var adapterConf = {
		// Max character length of paths and filenames
		MAX_PATH		: 260,
		MAX_FILENAME	: 255
	};


	return BlobFactory({

		// App-wide defaults for this adapter
		defaults: adapterConf,

		/**
		 * When collection is initialized, save its default config
		 */
		registerCollection: function (collection, cb) {
			collectionConfs[collection.identity] = collection.defaults;
			cb();
		},


		/**
		 * Read from provided fromStream and write to blob store
		 */

		write: function  ( incomingBatch, options, cb ) {
			// Gather up usage, collection, and adapter default options
			// TODO: automatically merge these options when possible in waterline-blob
			options = extendOptions(null, options);

			// Build context for this batch of files
			new Batch(incomingBatch, options, cb);
		},



		/**
		 * Read from blob store and write to specified download stream
		 */

		read: function ( downloadStream, options, cb ) {
			// Gather up usage, collection, and adapter default options
			// TODO: automatically merge these options when possible in waterline-blob
			options = extendOptions(null, options);

			return cb (new Error(
				'Not supported yet!' + 
				'For now, use the S3 URLs returned by `write()` to read uploaded files.'
			));
		}
	});



	/**
	 * Extend usage options (e.g. `File.write(options)`)
	 * with collection configuration (which also includes adapter defaults)
	 *
	 * @api private
	 */
	function extendOptions(cid, options) {
		if (cid) {
			return _.extend({}, adapterConf, collectionConfs[cid], options);
		}
		return _.extend({}, adapterConf, options);
	}

})();






//// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE ////
//// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE ////
//// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE ////
//// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE ////
//// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE ////
//// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE ////

// 		// Grab a logger (use sails.log if available)
// 		var log = typeof sails !== 'undefined' ? sails.log : {
// 			verbose: console.log,
// 			warn: console.warn,
// 			error: console.error
// 		};

		


			// Pipe bytes out to S3
			// fromStream.pipe(toS3);
			
			// Build full path and open writestream for this file
			// var destinationStream = S3.createWriteStream( path );
			
			// Handle errors writing thru adapter
			// (e.g. destination path does not exist)
			// destinationStream.on('error', function onWriteError ( e ) {
			// 	// `e instanceof Error`

			// 	// Friendly-ize known errors
			// 	if (e.code === 'ENOENT' && e.path) {
			// 		e.message = 'Could not write file to ' + e.path;
			// 	}

			// 	// Emit errors back up the fromBatch
			// 	fromBatch.emit('end', e);
			// 	return;
			// });

			
		
// }
//// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE ////
//// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE ////
//// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE ////
//// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE ////
//// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE //////// WRITE ////









//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////
//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////
//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////
//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////
//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////
//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////
//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////
//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////


	// // Grab a logger (use sails.log if available)
	// var log = typeof sails !== 'undefined' ? sails.log : {
	// 	verbose: console.log,
	// 	warn: console.warn,
	// 	error: console.error
	// };

	// // Makes callback optional, 
	// // and limits it to only fire once just in case
	// cb = cb ? _.once(cb) : function noopCb () {};
	
	// var splat = options.pathPrefix + '/' + options.filename;
	// log.verbose('LocalDiskAdapter.read files from ' + splat);

	// // apply splat expression e.g. `.tmp/uploads/*` and return a set
	// var globtions = {};

	// // Start glob stream
	// var glob = new Glob (splat, globtions);

	// // Handle end of the stream and errors
	// glob.once('abort', function globAborted () {
	// 	downloadStream.emit('glob_abort');
	// 	cb();
	// });
	// glob.once('end', function globDone (matches) {
	// 	downloadStream.emit('glob_done', matches);
	// 	cb(null, matches);
	// });
	// glob.once('error', function globError (err) {
	// 	err = err || new Error();
	// 	downloadStream.emit('glob_error', err);
	// 	cb(err);
	// });
	
	// // Acquire source stream(s) one by one
	// // as files come in from glob
	// glob.on('match', function globMatch (path) {
	// 	log.verbose('Found file @', path);

	// 	// Pass byte stream to download stream
	// 	var pausedStream = fs.createReadStream(path, {
	// 		encoding: options.encoding
	// 	});

	// 	// Start buffering bytes that arrive
	// 	// pausedStream.pause();

	// 	// Figure out file name and save reference as `filename`
	// 	pausedStream.filename = pausedStream.path.match(/\/([^/]+)\/?$/)[1];

	// 	// Notify downloadStream that a new file has come in
	// 	downloadStream.emit('file', pausedStream);
	// });

	// // return destination stream
	// return downloadStream;

//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////
//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////
//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////
//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////
//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////
//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////
//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////
//// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ //////// READ ////