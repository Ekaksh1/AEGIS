/**
 * AEGIS Combined Logic
 * Handles Navigation, Simulation, and Gemini AI Integration
 */

// --- GEMINI API INTEGRATION ---
// IMPORTANT: For local use, you must replace the empty string below with your actual API key.
// The environment variable logic only works within the online preview environment.
const apiKey = "";

async function callGemini(promptText) {
    if (!apiKey) {
        alert("API Key is missing! Please edit script.js and add your Gemini API key.");
        return "API Key missing.";
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{ text: promptText }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}

// --- AI FEATURE 1: GENERATE SCENARIO ---
async function generateAIScenario() {
    const inputField = document.getElementById('ai-scenario-input');
    const description = inputField.value.trim();
    const count = document.getElementById('sample-count').value;
    const btn = document.getElementById('btn-ai-gen');
    const errorMsg = document.getElementById('ai-error');

    if (!description) {
        alert("Please describe a scenario first!");
        return;
    }

    // UI State: Loading
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = `<span class="loading-spinner"></span> Generating...`;
    btn.disabled = true;
    errorMsg.style.display = 'none';

    // Prompt Engineering for JSON Output
    const prompt = `
        I need a JSON array of ${count} integers (between 0 and 255) representing an 8-bit bus simulation.
        The scenario is: "${description}".
        Return ONLY the raw JSON array. Do not include markdown formatting, backticks, or explanations. 
        Example output: [12, 255, 0, 128]
    `;

    try {
        let textResponse = await callGemini(prompt);

        // Cleanup response if model adds backticks
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        const dataArray = JSON.parse(textResponse);

        if (Array.isArray(dataArray)) {
            runHammingSimulation(dataArray);
            inputField.value = ''; // Clear input on success
        } else {
            throw new Error("Response was not an array");
        }

    } catch (err) {
        console.error(err);
        errorMsg.textContent = "Failed to generate scenario. Try again.";
        errorMsg.style.display = 'block';
    } finally {
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
    }
}

// --- AI FEATURE 2: ANALYZE RESULTS ---
let currentSimulationData = []; // Store for analysis

async function analyzeResults() {
    const btn = document.getElementById('btn-ai-analyze');
    const resultBox = document.getElementById('ai-analysis-result');
    const resultText = document.getElementById('analysis-text');

    if (currentSimulationData.length === 0) return;

    // UI State: Loading
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = `<span class="loading-spinner"></span> Analyzing...`;
    btn.disabled = true;
    resultBox.style.display = 'none';

    // Construct data summary for the model
    const dataSummary = currentSimulationData.map(d =>
        `Value:${d.val}, HW:${d.hw}, Power:${d.power}`
    ).join(' | ');

    const prompt = `
        Analyze this power simulation trace for an 8-bit system.
        Data Points (HW = Hamming Weight): [ ${dataSummary} ]
        
        Briefly explain the power consumption pattern found in this trace. 
        Are there sudden spikes or predictable patterns? 
        Keep the response concise (under 3 sentences) and insightful.
    `;

    try {
        const analysis = await callGemini(prompt);
        resultText.textContent = analysis;
        resultBox.style.display = 'block';
    } catch (err) {
        alert("Analysis failed. Please check console.");
    } finally {
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
    }
}

// --- NAVIGATION LOGIC ---
function navigateTo(sectionId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.add('active');
    const navLink = document.getElementById(`nav-${sectionId}`);
    if (navLink) navLink.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- SIMULATION LOGIC ---
function getHammingWeight(n) {
    let count = 0;
    while (n > 0) {
        n &= (n - 1);
        count++;
    }
    return count;
}

let totalSimulations = 0;

// Modified to accept optional external data (from AI)
function runHammingSimulation(externalData = null) {
    const countInput = document.getElementById('sample-count');
    let count = parseInt(countInput.value);

    // If external data provided, use its length
    if (externalData && Array.isArray(externalData)) {
        count = externalData.length;
    } else {
        if (count > 50) count = 50;
        if (count < 1) count = 1;
    }

    // Reset current data for analysis
    currentSimulationData = [];

    let outputHtml = `
        <table class="results-table">
            <thead>
                <tr>
                    <th>Value (Dec)</th>
                    <th>Binary</th>
                    <th>Hamming Weight</th>
                    <th>Power Proxy</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 0; i < count; i++) {
        let val;

        if (externalData) {
            val = externalData[i];
            // Clamp to 8-bit just in case
            val = Math.max(0, Math.min(255, parseInt(val)));
        } else {
            val = Math.floor(Math.random() * 256);
        }

        const hw = getHammingWeight(val);
        const bin = val.toString(2).padStart(8, '0');
        const power = (hw * 1.2).toFixed(2); // Simple proxy: HW * 1.2mA

        // Store for AI analysis
        currentSimulationData.push({ val, hw, power });

        outputHtml += `
            <tr>
                <td>${val}</td>
                <td><code>${bin}</code></td>
                <td><strong>${hw}</strong></td>
                <td>${power} mA</td>
            </tr>
        `;
    }

    outputHtml += `</tbody></table>`;

    document.getElementById('simulation-output').innerHTML = outputHtml;

    // Show analysis button
    document.getElementById('analysis-actions').style.display = 'block';
    // Hide previous analysis result if any
    document.getElementById('ai-analysis-result').style.display = 'none';

    totalSimulations++;
    document.getElementById('total-sims').textContent = totalSimulations;
}

// Initialize
console.log('AEGIS SPA Loaded Successfully');