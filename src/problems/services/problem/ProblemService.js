const { db } = require('~/common/configs/firebase');
const { PROBLEMS, TEST_CASES, PARAMETERS, LIBRARY_SUPPORT, COMMENTS, SUBMISSIONS } = require('~/common/utils/constants');
const Problem = require('~/problems/models/Problem');
// const ProblemNotFoundException = require('~/common/exceptions/ProblemNotFoundException');
const ProblemMapper = require('~/problems/mappers/ProblemMapper');



const ProblemService = {
    findById: async (problemId) => {
        const problemRef = db.collection(PROBLEMS).doc(problemId);
        const problemDoc = await problemRef.get();

        const commentsRef = db.collection(COMMENTS).where("problemId", "==", problemId);
        const commentsSnapshot = await commentsRef.get();
        const comments = [];
        commentsSnapshot.forEach((doc) => {
            comments.push(doc.data());
        });

        const submissionsRef = db.collection(SUBMISSIONS).where("problemId", "==", problemId);
        const submissionsSnapshot = await submissionsRef.get();
        const submissions = [];
        submissionsSnapshot.forEach((doc) => {
            submissions.push(doc.data());
        });

        if (!problemDoc.exists) {
            throw new ProblemNotFoundException("Requested problem not found");
        }

        const addedAt = new Date(problemDoc.data().addedAt._seconds * 1000).toLocaleString();
        const updatedAt = new Date(problemDoc.data().updatedAt._seconds * 1000).toLocaleString();

        const problem = new Problem(
            problemId,
            problemDoc.data().title,
            problemDoc.data().description,
            addedAt,
            updatedAt,
            problemDoc.data().functionName,
            problemDoc.data().correctAnswer,
            problemDoc.data().outputDataType,
            problemDoc.data().difficulty,
            problemDoc.data().isDeleted,
            problemDoc.data().ownerId,
            comments,
            submissions
        );

        return ProblemMapper.toDTO(problem);
    },

    getAll: async () => {
        const problemsRef = db.collection(PROBLEMS);
        const problemsSnapshot = await problemsRef.get();

        if (problemsSnapshot.empty) {
            return [];
        }

        const problemIds = [];
        problemsSnapshot.forEach((doc) => {
            if (!doc.data().isDeleted) {
                problemIds.push(doc.id);
            }
        });

        const problemDTOs = await Promise.all(problemIds.map(id => ProblemService.findById(id)));
        return problemDTOs;
    },

    add: async (request) => {
        try {
            const problem = await createAndSaveProblemFromRequest(request.problem);
            await createAndSaveTestCaseFromRequest(request.testcases, problem.id);
            await createAndSaveLibraryFromRequest(request.libraries, problem.id);
            return true;
        } catch (error) {
            console.info(error.message);
            return false;
        }
    },

    delete: async (problemId) => {
        await db.collection(PROBLEMS).doc(problemId).update({ isDeleted: true });
        return true;
    },
};

const createAndSaveLibraryFromRequest = async (libraries, problemId) => {
    for (const library of libraries) {
        await db.collection(LIBRARY_SUPPORT).doc().set({
            name: library,
            problemId: problemId
        });
    }
};

const createAndSaveTestCaseFromRequest = async (testcaseDTOs, problemId) => {
    for (const dto of testcaseDTOs) {
        const docRef = db.collection(TEST_CASES).doc();
        await docRef.set({
            output: dto.output,
            problemId: problemId
        });
        const testCaseId = docRef.id;
        console.log(testCaseId);
        await createAndSaveParameterFromRequest(testCaseId, dto.input);
    }
};

async function createAndSaveParameterFromRequest(testCaseId, input) {
    for (const param of input) {
        await db.collection(PARAMETERS).add({
            name: param.paramName,
            datatype: param.datatype,
            input: param.value,
            testCaseId: testCaseId
        });
    }
}


const createAndSaveProblemFromRequest = async (problemDTO) => {
    const docRef = db.collection(PROBLEMS).doc();
    await docRef.set({
        title: problemDTO.title,
        description: problemDTO.description,
        addedAt: new Date(),
        updatedAt: new Date(),
        functionName: problemDTO.functionName,
        correctAnswer: problemDTO.correctAnswer,
        outputDataType: problemDTO.outputDataType,
        difficulty: problemDTO.difficulty,
        isDeleted: false
        // ownerId: problemDTO.ownerId
    });
    const problem = new Problem(docRef.id, problemDTO.title, problemDTO.description, new Date(), new Date(), problemDTO.functionName, problemDTO.correctAnswer, problemDTO.outputDataType, problemDTO.difficulty, false, null);
    return problem;
};

module.exports = ProblemService;

