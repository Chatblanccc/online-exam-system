import { Question, QuestionType } from "@/generated/prisma/client";

type AnswerInput = {
  questionId: string;
  answerValue: string;
};

type GradedAnswer = {
  questionId: string;
  answerValue: string;
  isCorrect: boolean | null;
  scoreObtained: number | null;
};

const normalize = (value: string) => value.trim().toLowerCase();

export function gradeAnswers(
  questions: Question[],
  answers: AnswerInput[],
) {
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const graded: GradedAnswer[] = [];
  let totalScore = 0;

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) {
      continue;
    }

    let isCorrect: boolean | null = null;
    let scoreObtained: number | null = null;

    if (
      question.type === QuestionType.SINGLE_CHOICE ||
      question.type === QuestionType.TRUE_FALSE ||
      question.type === QuestionType.SHORT_ANSWER
    ) {
      const expected = question.correctAnswer
        ? normalize(question.correctAnswer)
        : "";
      const actual = normalize(answer.answerValue);
      
      if (question.type === QuestionType.SHORT_ANSWER) {
        // 对于简答题/操作题，如果包含关键词即视为正确（简单逻辑）
        isCorrect = expected.length > 0 && actual.includes(expected);
      } else {
        isCorrect = expected.length > 0 && actual === expected;
      }
      
      scoreObtained = isCorrect ? question.points : 0;
    }

    if (scoreObtained !== null) {
      totalScore += scoreObtained;
    }

    graded.push({
      questionId: answer.questionId,
      answerValue: answer.answerValue,
      isCorrect,
      scoreObtained,
    });
  }

  return { graded, totalScore };
}

