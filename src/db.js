import Dexie from 'dexie';

export const db = new Dexie('HealthTrackerDB');

db.version(1).stores({
  symptomLogs: '++id, date, fever, tonsilSize, pusCoverage, lymphNodes, rash, cough, sneezing, mood, irritability, ocd, tics, regression, sleepIssues, appetite, socialWithdrawal',
  riskAssessments: '++id, date, strepProbability, viralProbability, explanation',
  decisionFlow: '++id, date, previousSymptoms, nextQuestion, explanation',
  longTermTracking: '++id, date, strepRiskOverTime, viralRiskOverTime, finalAssessment'
});
