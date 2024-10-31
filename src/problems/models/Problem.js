// models/Problem.js

class Problem {
  constructor(
    id,
    title,
    description,
    createdAt,
    updatedAt,
    functionName,
    correctAnswer,
    outputDataType,
    difficulty,
    isDeleted,
    ownerId,
    comments,
    submissions
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.functionName = functionName;
    this.correctAnswer = correctAnswer;
    this.outputDataType = outputDataType;
    this.difficulty = difficulty;
    this.isDeleted = isDeleted;
    this.owner = ownerId;
    // this.topics = [];
    // this.contests = [];
    // this.librariesSupports = [];
    // this.testCases = [];
    this.comments = comments;
    this.submissions = submissions;
  }
}

module.exports = Problem;
