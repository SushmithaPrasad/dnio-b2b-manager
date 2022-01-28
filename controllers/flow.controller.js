const router = require('express').Router();
const log4js = require('log4js');
const mongoose = require('mongoose');

const queryUtils = require('../utils/query.utils');

const logger = log4js.getLogger('flow.controller');
const flowModel = mongoose.model('flow');


router.get('/', async (req, res) => {
    try {
        const filter = queryUtils.parseFilter(req);
        if (req.query.countOnly) {
            const count = await flowModel.countDocuments(filter);
            return res.status(200).json(count);
        }
        const data = queryUtils.getPaginationData(req);
        const docs = await flowModel.find(filter).select(data.select).sort(data.sort).skip(data.skip).limit(data.count).lean();
        res.status(200).json(docs);
    } catch (e) {
        logger.error(err);
        if (typeof err === 'string') {
            return res.status(500).json({
                message: err
            });
        }
        res.status(500).json({
            message: err.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        let mongoQuery = flowModel.findById(req.params.id);
        if (req.query.select) {
            mongoQuery = mongoQuery.select(req.query.select);
        }
        let doc = await mongoQuery.lean();
        if (!doc) {
            return res.status(404).json({
                message: 'Data Model Not Found'
            });
        }
        res.status(200).json(doc);
    } catch (err) {
        logger.error(err);
        if (typeof err === 'string') {
            return res.status(500).json({
                message: err
            });
        }
        res.status(500).json({
            message: err.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const payload = req.body;
        const key = payload.jsonSchema.title.toCamelCase();
        logger.info(key);
        let doc = await flowModel.findOne({ key });
        if (doc) {
            return res.status(400).json({
                message: 'Data Model with Same Key Exist'
            });
        }
        payload.key = key;
        doc = new flowModel(payload);
        const status = await doc.save(req);
        res.status(200).json(status);
    } catch (err) {
        logger.error(err);
        if (typeof err === 'string') {
            return res.status(500).json({
                message: err
            });
        }
        res.status(500).json({
            message: err.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const payload = req.body;
        let doc = await flowModel.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({
                message: 'Data Model Not Found'
            });
        }
        Object.keys(payload).forEach(key => {
            doc[key] = payload[key];
        });
        const status = await doc.save(req);
        res.status(200).json(status);
    } catch (err) {
        logger.error(err);
        if (typeof err === 'string') {
            return res.status(500).json({
                message: err
            });
        }
        res.status(500).json({
            message: err.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        let doc = await flowModel.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({
                message: 'Data Model Not Found'
            });
        }
        const status = await doc.remove(req);
        res.status(200).json({
            message: 'Document Deleted'
        });
    } catch (err) {
        logger.error(err);
        if (typeof err === 'string') {
            return res.status(500).json({
                message: err
            });
        }
        res.status(500).json({
            message: err.message
        });
    }
});

module.exports = router;