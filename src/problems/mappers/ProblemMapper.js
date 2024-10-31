const ProblemMapper = {
    toDTO: (problem) => {
        return {
            id: problem.id,
            title: problem.title,
            description: problem.description,
            point: problem.point,
            difficulty: problem.difficulty,
            isDeleted: problem.isDeleted,
            acceptedCount: ProblemMapper.countAccepted(problem),
            discussCount: ProblemMapper.countComment(problem),
            submissionCount: problem.submissions ? problem.submissions.length : 0,
            acceptanceRate: ProblemMapper.getAcceptanceRate(problem),
        };
    },

    toDTOs: (problems) => {
        return problems.map((problem) => ProblemMapper.toDTO(problem));
    },

    toEntity: (problemDTO) => {
        return {
            id: problemDTO.id,
            title: problemDTO.title,
            description: problemDTO.description,
            point: problemDTO.point,
            difficulty: problemDTO.difficulty,
            isDeleted: problemDTO.isDeleted,
            createdAt: problemDTO.createdAt,
            updatedAt: problemDTO.updatedAt,
            functionName: problemDTO.functionName,
            correctAnswer: problemDTO.correctAnswer,
            outputDataType: problemDTO.outputDataType,
            ownerId: problemDTO.ownerId,
        };
    },

    toEntities: (problemDTOs) => {
        return problemDTOs.map((problemDTO) => ProblemMapper.toEntity(problemDTO));
    },

    countAccepted: (problem) => {
        return problem.submissions ? problem.submissions.filter((s) => s.status === 'ACCEPTED').length : 0;
    },

    countComment: (problem) => {
        return problem.comments ? problem.comments.filter((c) => !c.isDeleted).length : 0;
    },

    getAcceptanceRate: (problem) => {
        const totalSubmissions = problem.submissions ? problem.submissions.length : 0;
        const acceptedSubmissions = ProblemMapper.countAccepted(problem);
        return totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;
    },
};

module.exports = ProblemMapper;
