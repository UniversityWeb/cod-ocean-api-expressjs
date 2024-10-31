const ProblemService = require('~/problems/services/problem/ProblemService');

const ProblemController = {
    async getAll(req, res) {
        try {
            const problems = await ProblemService.getAll();
            res.status(200).json(problems);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async getById(req, res) {
        try {
            const problem = await ProblemService.findById(req.params.id);
            res.status(200).json(problem);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async add(req, res) {
        try {
            const result = await ProblemService.add(req.body);
            res.status(200).json({ message: result ? 'Problem added successfully' : 'Failed to add problem' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async delete(req, res) {
        try {
            const result = await ProblemService.delete(req.params.id);
            res.status(200).json({ message: result ? 'Problem deleted successfully' : 'Failed to delete problem' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = ProblemController;



