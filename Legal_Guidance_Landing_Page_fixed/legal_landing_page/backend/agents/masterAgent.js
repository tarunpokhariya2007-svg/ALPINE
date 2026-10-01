const askAI = require("../services/groqService");
const caseAnalyzer = require("./caseAnalyzer");
const lawResearchAgent = require("./lawResearchAgent");
const lawyerRecommendationAgent = require("./lawyerRecommendationAgent");
const reportGeneratorAgent = require("./reportGeneratorAgent");
const { saveCase } = require("../database/caseModel");

console.log("MASTER AGENT USING GROQ");

async function masterAgent(data) {
    try {

        console.log("==================================");
        console.log("MASTER AGENT STARTED");
        console.log("User Request:", data.case);

        // ==============================
        // STEP 1 - Case Analyzer
        // ==============================

        console.log("Running Case Analyzer...");
        const analysis = await caseAnalyzer(data.case);

        // ==============================
        // STEP 2 - Law Research
        // ==============================

        console.log("Running Law Research Agent...");
        const lawResearch = await lawResearchAgent(data.case);

        // ==============================
        // STEP 3 - Lawyer Recommendation
        // ==============================

        console.log("Running Lawyer Recommendation Agent...");
        const lawyerRecommendation = await lawyerRecommendationAgent(data.case);

        console.log("==================================");
        console.log("LAWYER RECOMMENDATION OBJECT:");
        console.log(lawyerRecommendation);

        console.log("SPECIALIZATION:");
        console.log(lawyerRecommendation.specialization);

        // ==============================
        // STEP 4 - Report Generator
        // ==============================

        console.log("Running Report Generator...");

        const report = await reportGeneratorAgent(
            analysis,
            lawResearch,
            lawyerRecommendation.specialization
        );

        console.log("==================================");
        console.log("CASE ANALYSIS");
        console.log(analysis);

        console.log("==================================");
        console.log("LEGAL RESEARCH");
        console.log(lawResearch);

        console.log("==================================");
        console.log("REPORT");
        console.log(report);

        // ==============================
        // FINAL PROMPT
        // ==============================

        const prompt = `
You are NyayaAI, an expert Indian legal assistant.

A specialized multi-agent AI system has already analyzed the user's case.

================================

Case Analysis

${analysis}

================================

Legal Research

${lawResearch}

================================

Recommended Legal Specialization

${lawyerRecommendation.specialization}

================================

Generated Report

${report}

================================

Now use ALL of the above information together with the user's original legal issue to generate the final legal guidance.

User's Legal Issue:

${data.case}

Follow ONLY Indian law.

Use:

- Bharatiya Nyaya Sanhita (BNS)
- Bharatiya Nagarik Suraksha Sanhita (BNSS)
- Bharatiya Sakshya Adhiniyam (BSA)
- Constitution of India
- Relevant Acts whenever applicable.

Your response must include:

1. Case Summary
2. Relevant Indian Legal Sections
3. Punishment (if applicable)
4. Citizen Rights
5. Next Steps
6. Documents Required
7. Whether consulting a lawyer is recommended.

IMPORTANT:

- Mention ONLY the type of lawyer required.
- DO NOT mention any lawyer names.
- DO NOT recommend any law firms.
- DO NOT mention advocates from the database.
- Keep the response professional and easy to understand.
`;

        console.log("Sending request to Groq...");

        const answer = await askAI(prompt);

        console.log("FINAL RESPONSE GENERATED");

        // ==============================
        // SAVE CASE
        // ==============================

        await saveCase(
          data.userId,
          data.case,
          data.case,
          lawyerRecommendation.specialization,
          "Medium"
        );
        return {
            success: true,
            response: answer,
            specialization: lawyerRecommendation.specialization
        };

    } catch (err) {

        console.error("==================================");
        console.error("MASTER AGENT ERROR");
        console.error(err);

        return {
            success: false,
            error: err.message
        };
    }
}

module.exports = masterAgent;