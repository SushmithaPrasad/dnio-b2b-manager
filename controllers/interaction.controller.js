const router = require('express').Router({ mergeParams: true });
const log4js = require('log4js');
const mongoose = require('mongoose');
const _ = require('lodash');

const config = require('../config');
const queryUtils = require('../utils/query.utils');

const logger = log4js.getLogger(global.loggerName);
const interactionModel = mongoose.model('interaction');



router.get('/', async (req, res) => {
	try {
		const filter = queryUtils.parseFilter(req.query.filter);
		if (req.query.countOnly) {
			const count = await interactionModel.countDocuments(filter);
			return res.status(200).json(count);
		}
		const data = queryUtils.getPaginationData(req);
		const docs = await interactionModel.find(filter).select(data.select).sort(data.sort).skip(data.skip).limit(data.count).lean();
		res.status(200).json(docs);
	} catch (err) {
		logger.error(err);
		res.status(500).json({
			message: err.message
		});
	}
});

router.get('/:id', async (req, res) => {
	try {
		let doc = await interactionModel.findById(req.params.id).lean();
		if (!doc) {
			return res.status(404).json({
				message: 'Data Model Not Found'
			});
		}
		res.status(200).json(doc);
	} catch (err) {
		logger.error(err);
		res.status(500).json({
			message: err.message
		});
	}
});


router.post('/utils/update', async (req, res) => {
	try {
		const filter = req.query.filter;
		const payload = req.body;
		const doc = interactionModel.findOne(filter);
		if (!doc) {
			return res.status(404).json({
				message: 'Data Model Not Found'
			});
		}
		_.merge(doc, payload);
		const status = await doc.save(req);
		res.status(200).json(status);
	} catch (err) {
		logger.error(err);
		res.status(500).json({
			message: err.message
		});
	}
});


// router.post('/', async (req, res) => {
// 	try {
// 		const payload = req.body;
// 		doc = new interactionModel(payload);
// 		const status = await doc.save(req);
// 		res.status(200).json(status);
// 	} catch (err) {
// 		logger.error(err);
// 		res.status(500).json({
// 			message: err.message
// 		});
// 	}
// });

router.put('/:id', async (req, res) => {
	try {
		const payload = req.body;
		let doc = await interactionModel.findById(req.params.id);
		if (!doc) {
			return res.status(404).json({
				message: 'Data Model Not Found'
			});
		}
		_.merge(doc, payload);
		const status = await doc.save(req);
		res.status(200).json(status);
	} catch (err) {
		logger.error(err);
		res.status(500).json({
			message: err.message
		});
	}
});

// router.delete('/:id', async (req, res) => {
// 	try {
// 		let doc = await interactionModel.findById(req.params.id);
// 		if (!doc) {
// 			return res.status(404).json({
// 				message: 'Data Model Not Found'
// 			});
// 		}
// 		await doc.remove(req);
// 		res.status(200).json({
// 			message: 'Document Deleted'
// 		});
// 	} catch (err) {
// 		logger.error(err);
// 		res.status(500).json({
// 			message: err.message
// 		});
// 	}
// });

router.get('/:flowId/:interactionId/state', async (req, res) => {
	try {
		let doc = await interactionModel.findById(req.params.flowId).lean();
		if (!doc) {
			return res.status(404).json({
				message: 'Data Model Not Found'
			});
		}
		const dbname = config.DATA_STACK_NAMESPACE + '-' + doc.app;
		const records = await global.appcenterCon.db(dbname).collection('b2b.node.state').find({ interactionId: req.params.interactionId }).lean();
		res.status(200).json(records);
	} catch (err) {
		logger.error(err);
		res.status(500).json({
			message: err.message
		});
	}
});

module.exports = router;