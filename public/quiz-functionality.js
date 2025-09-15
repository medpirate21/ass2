// Global variables
let availableSubjects = [];
let loadedSubjectData = new Map();
let currentSubjectData = null;
let currentSubject = '';
let currentQuestionIndex = 0;
let selectedAnswers = {};
let questions = [];
let quizMode = 'normal';
let examTimer = null;
let timeRemaining = 63;
let examStartTime = null;
let examAnswers = [];
let examTimeSpent = [];

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Load subjects metadata
async function loadAvailableSubjects() {
    try {
        const response = await fetch('/data/metadata.json');
        if (response.ok) {
            const metadata = await response.json();
            availableSubjects = [];
            
            for (const [filename, data] of Object.entries(metadata)) {
                availableSubjects.push({
                    filename: filename,
                    name: data.name,
                    description: data.description,
                    stats: data.stats,
                    file_size: data.file_size,
                    subjects_count: data.subjects_count
                });
            }
        } else {
            throw new Error('Metadata file not found');
        }
        
        populateSubjectButtons();
        updateOverallStats();
        
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('subjectSection').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading subjects:', error);
        document.getElementById('loading').innerHTML = '<p>Error loading subjects. Please check data directory.</p>';
    }
}

// Populate subject buttons
function populateSubjectButtons() {
    const grid = document.getElementById('subjectsGrid');
    grid.innerHTML = '';
    
    availableSubjects.forEach(subject => {
        const button = document.createElement('button');
        button.className = 'subject-btn';
        button.onclick = () => selectSubject(subject.filename);
        
        button.innerHTML = `
            <div class="subject-title">${subject.name}</div>
            <div class="subject-stats">
                <i class="fas fa-question-circle"></i> ${subject.stats.total_questions || 0} questions
                <i class="fas fa-folder"></i> ${subject.stats.total_topics || 0} topics
            </div>
            <div class="arena-badge">
                <i class="fas fa-check-circle"></i>
                Available
            </div>
        `;
        
        grid.appendChild(button);
    });
}

// Select subject and load data
async function selectSubject(filename) {
    try {
        console.log('Loading subject:', filename);
        
        let data = null;
        
        if (loadedSubjectData.has(filename)) {
            data = loadedSubjectData.get(filename);
        } else {
            const response = await fetch("/data/" + filename);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            data = await response.json();
            loadedSubjectData.set(filename, data);
        }
        
        currentSubjectData = data;
        currentSubject = filename;
        
        openNavigationModal();
        populateSubjects();
        
    } catch (error) {
        console.error('Error loading subject:', error);
        alert('Failed to load subject data. Please try again.');
    }
}

// Modal functions
function openNavigationModal() {
    document.getElementById('navigationModal').classList.add('show');
}

function closeNavigationModal() {
    document.getElementById('navigationModal').classList.remove('show');
}

// Populate dropdowns
function populateSubjects() {
    const select = document.getElementById('subjectSelect');
    select.innerHTML = '<option value="">Select Subject</option>';
    
    if (currentSubjectData && currentSubjectData.subjects) {
        Object.keys(currentSubjectData.subjects).forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            select.appendChild(option);
        });
    }
    
    clearTopics();
}

function populateTopics() {
    const selectedSubject = document.getElementById('subjectSelect').value;
    const topicSelect = document.getElementById('topicSelect');
    
    topicSelect.innerHTML = '<option value="">Select Topic</option>';
    
    if (selectedSubject && currentSubjectData && currentSubjectData.subjects[selectedSubject]) {
        const subjectData = currentSubjectData.subjects[selectedSubject];
        if (subjectData.topics) {
            subjectData.topics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic.topic_name;
                option.textContent = topic.topic_name;
                topicSelect.appendChild(option);
            });
        }
    }
    
    updateCurrentStats();
}

function clearTopics() {
    document.getElementById('topicSelect').innerHTML = '<option value="">Select Topic</option>';
}

// Update statistics
function updateCurrentStats() {
    const selectedSubject = document.getElementById('subjectSelect').value;
    const selectedTopic = document.getElementById('topicSelect').value;
    const statsDiv = document.getElementById('currentStats');
    
    if (!selectedSubject || !selectedTopic || !currentSubjectData) {
        statsDiv.innerHTML = '';
        return;
    }
    
    const subjectData = currentSubjectData.subjects[selectedSubject];
    const topicData = subjectData.topics.find(topic => topic.topic_name === selectedTopic);
    
    if (topicData) {
        statsDiv.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${topicData.questions.length}</div>
                <div class="stat-label">Questions</div>
            </div>
        `;
    }
}

function updateOverallStats() {
    const statsDiv = document.getElementById('overallStats');
    
    const totalQuestions = availableSubjects.reduce((sum, s) => sum + (s.stats.total_questions || 0), 0);
    const totalTopics = availableSubjects.reduce((sum, s) => sum + (s.stats.total_topics || 0), 0);
    
    statsDiv.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${availableSubjects.length}</div>
            <div class="stat-label">Subjects</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${totalTopics}</div>
            <div class="stat-label">Topics</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${totalQuestions}</div>
            <div class="stat-label">Questions</div>
        </div>
    `;
}

// Mode selection
function selectMode(mode) {
    quizMode = mode;
    const normalBtn = document.getElementById('normalModeBtn');
    const examBtn = document.getElementById('examModeBtn');
    const description = document.getElementById('modeDescription');
    
    if (mode === 'normal') {
        normalBtn.style.background = 'var(--glass-accent)';
        normalBtn.style.color = 'white';
        examBtn.style.background = 'transparent';
        examBtn.style.color = 'var(--glass-accent)';
        description.textContent = 'Practice mode with instant feedback and explanations';
    } else {
        examBtn.style.background = 'var(--glass-accent)';
        examBtn.style.color = 'white';
        normalBtn.style.background = 'transparent';
        normalBtn.style.color = 'var(--glass-accent)';
        description.textContent = 'Timed exam mode (63s per question) with results at the end';
    }
}

// Start quiz
function startQuiz() {
    const selectedSubject = document.getElementById('subjectSelect').value;
    const selectedTopic = document.getElementById('topicSelect').value;
    
    if (!selectedSubject || !selectedTopic) {
        alert('Please select both subject and topic');
        return;
    }
    
    const subjectData = currentSubjectData.subjects[selectedSubject];
    const topicData = subjectData.topics.find(topic => topic.topic_name === selectedTopic);
    
    if (!topicData || !topicData.questions || topicData.questions.length === 0) {
        alert('No questions found for this topic');
        return;
    }
    
    questions = topicData.questions;
    currentQuestionIndex = 0;
    selectedAnswers = {};
    
    if (quizMode === 'exam') {
        examStartTime = new Date();
        examAnswers = [];
        examTimeSpent = [];
        document.getElementById('examTimer').classList.remove('hidden');
        document.getElementById('submitExamBtn').classList.remove('hidden');
    } else {
        document.getElementById('examTimer').classList.add('hidden');
        document.getElementById('submitExamBtn').classList.add('hidden');
    }
    
    closeNavigationModal();
    document.getElementById('subjectSection').classList.add('hidden');
    document.getElementById('quizSection').classList.remove('hidden');
    
    loadQuestion();
}

// Load question
function loadQuestion() {
    if (!questions || questions.length === 0) return;
    
    const question = questions[currentQuestionIndex];
    
    if (quizMode === 'exam') {
        stopTimer();
        startTimer();
    }
    
    document.getElementById('questionNumber').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    document.getElementById('questionText').innerHTML = (question.text ?? question.question ?? '');
    
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
    
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.onclick = () => selectAnswer(index);
        
        const isSelected = selectedAnswers[currentQuestionIndex] === index;
        if (isSelected) {
            optionDiv.classList.add('selected');
        }
        
        const optText = typeof option === 'object' ? option.text : option;
        
        optionDiv.innerHTML = `
            <div class="option-letter">${String.fromCharCode(65 + index)}</div>
            <div>${optText}</div>
        `;
        
        optionsGrid.appendChild(optionDiv);
    });
    
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    
    const nextBtn = document.getElementById('nextBtn');
    const nextBtnText = document.getElementById('nextBtnText');
    const nextBtnIcon = document.getElementById('nextBtnIcon');
    
    if (currentQuestionIndex === questions.length - 1) {
        nextBtnText.textContent = quizMode === 'exam' ? 'Submit Exam' : 'Finish';
        nextBtnIcon.className = 'fas fa-check';
    } else {
        nextBtnText.textContent = 'Next';
        nextBtnIcon.className = 'fas fa-chevron-right';
    }
    
    if (quizMode === 'normal' && selectedAnswers[currentQuestionIndex] !== undefined) {
        showExplanation();
    } else {
        document.getElementById('explanation').classList.add('hidden');
    }
}

// Select answer
function selectAnswer(selectedValue) {
    selectedAnswers[currentQuestionIndex] = selectedValue;
    
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = options[selectedValue];
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    if (quizMode === 'normal') {
        showExplanation();
    }
}

// Show explanation
function showExplanation() {
    const question = questions[currentQuestionIndex];
    const explanationDiv = document.getElementById('explanation');
    
    // Find correct answer
    let correctIndex = -1;
    if (question.options) {
        correctIndex = question.options.findIndex(opt => 
            typeof opt === 'object' && opt.is_correct === true
        );
    }
    
    const selectedIndex = selectedAnswers[currentQuestionIndex];
    const isCorrect = selectedIndex === correctIndex;
    
    // Update answer summary
    const summaryDiv = document.getElementById('answerSummary');
    if (summaryDiv) {
        const correctLetter = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : '-';
        const userLetter = selectedIndex !== undefined ? String.fromCharCode(65 + selectedIndex) : '-';
        
        summaryDiv.innerHTML = `
            <div class="answer-row">
                <span class="answer-label">Correct Answer:</span>
                <span class="answer-chip">${correctLetter}</span>
            </div>
            <div class="answer-row ${isCorrect ? 'answer-correct' : 'answer-incorrect'}">
                <span class="answer-label">Your Answer:</span>
                <span class="answer-chip">${userLetter}</span>
            </div>
        `;
    }
    
    // Update explanation text
    const explanationText = document.getElementById('explanationText');
    if (explanationText) {
        explanationText.innerHTML = question.explanation || 'No explanation available.';
    }
    
    explanationDiv.classList.remove('hidden');
}

// Timer functions
function startTimer() {
    if (quizMode !== 'exam') return;
    
    timeRemaining = 63;
    updateTimerDisplay();
    
    examTimer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(examTimer);
            nextQuestion();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = display;
    }
}

function stopTimer() {
    if (examTimer) {
        clearInterval(examTimer);
        examTimer = null;
    }
}

// Navigation
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

function nextQuestion() {
    if (quizMode === 'exam') {
        stopTimer();
    }
    
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        if (quizMode === 'exam') {
            showExamResults();
        } else {
            alert('Quiz completed!');
            restartQuiz();
        }
    }
}

// Exam functions
function confirmSubmitExam() {
    const remainingQuestions = questions.length - Object.keys(selectedAnswers).length;
    const remainingEl = document.getElementById('remainingQuestions');
    if (remainingEl) {
        remainingEl.textContent = remainingQuestions;
    }
    document.getElementById('submitConfirmModal').style.display = 'flex';
}

function closeSubmitConfirm() {
    document.getElementById('submitConfirmModal').style.display = 'none';
}

function submitExam() {
    closeSubmitConfirm();
    showExamResults();
}

function showExamResults() {
    stopTimer();
    
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;
    
    questions.forEach((question, index) => {
        const userAnswer = selectedAnswers[index];
        if (userAnswer !== undefined) {
            const correctIndex = question.options.findIndex(opt => 
                typeof opt === 'object' && opt.is_correct === true
            );
            if (userAnswer === correctIndex) {
                correctAnswers++;
            } else {
                wrongAnswers++;
            }
        } else {
            unanswered++;
        }
    });
    
    const totalMarks = correctAnswers * 4 - wrongAnswers * 1;
    const maxMarks = questions.length * 4;
    const percentage = Math.round((totalMarks / maxMarks) * 100);
    
    document.getElementById('examResultsContent').innerHTML = `
        <div class="exam-summary">
            <div class="summary-stats">
                <div class="stat-card">
                    <div class="stat-number">${totalMarks}/${maxMarks}</div>
                    <div class="stat-label">Total Marks</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${percentage}%</div>
                    <div class="stat-label">Percentage</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${correctAnswers}</div>
                    <div class="stat-label">Correct</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${wrongAnswers}</div>
                    <div class="stat-label">Wrong</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${unanswered}</div>
                    <div class="stat-label">Unanswered</div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('examResultsModal').style.display = 'flex';
}

function closeExamResults() {
    document.getElementById('examResultsModal').style.display = 'none';
}

function restartQuiz() {
    closeExamResults();
    document.getElementById('quizSection').classList.add('hidden');
    document.getElementById('subjectSection').classList.remove('hidden');
    currentQuestionIndex = 0;
    selectedAnswers = {};
    examAnswers = [];
    examTimeSpent = [];
    stopTimer();
}
