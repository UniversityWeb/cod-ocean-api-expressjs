const express = require('express');
const router = express.Router();
const ProblemController = require('~/problems/controller/ProblemController');

router.get('/', ProblemController.getAll);
router.get('/:id', ProblemController.getById);
router.post('/', ProblemController.add);
router.delete('/:id', ProblemController.delete);

module.exports = router;
