export class FirstQuestionLineParsingResults {
  externalNumber: string; // отображаемый номер задания
  lowestInternalNumber: number; // если задание содержит несколько номеров, то наименьший
  highestInternalNumber: number; // если задание содержит несколько номеров, то наибольший
  isGraded: boolean;
  questionTitle: string;
}
