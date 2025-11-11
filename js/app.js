document.addEventListener('DOMContentLoaded', () => {
    const exercisesContainer = document.getElementById('exercises-container');
    const selectedListContainer = document.getElementById('selected-exercises-list');
    const currentScoreEl = document.getElementById('current-score');
    const targetScoreEl = document.getElementById('target-score');
    const targetScoreSummaryEl = document.getElementById('target-score-summary');
    const progressFillEl = document.getElementById('progress-fill');
    const generateBtn = document.getElementById('generate-btn');
    const linkContainer = document.getElementById('link-container');
    const generatedLinkInput = document.getElementById('generated-link');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const pageTitle = document.getElementById('page-title');

    let allData = null;
    let selectedExercises = [];

    // Загрузка данных из JSON
    async function loadData() {
        try {
            const response = await fetch('data/exercises.json');
            allData = await response.json();
            initializeApp();
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
            exercisesContainer.innerHTML = "<p>Не удалось загрузить задания. Проверьте файл data/exercises.json</p>";
        }
    }

    function initializeApp() {
        pageTitle.textContent = allData.title;
        targetScoreEl.textContent = allData.targetScore;
        targetScoreSummaryEl.textContent = allData.targetScore;
        renderExercises();
    }

    function renderExercises() {
        exercisesContainer.innerHTML = '';
        allData.exercises.forEach(exercise => {
            const category = allData.categories.find(c => c.id === exercise.categoryId);
            const card = document.createElement('article');
            card.className = 'exercise-card';
            card.dataset.id = exercise.id;
            card.dataset.points = exercise.points;
            card.style.borderColor = category.color;

            card.innerHTML = `
                <div class="card-header">
                    <span class="card-category" style="background-color: ${category.color}">${category.name}</span>
                    <span class="card-points">${exercise.points} балл.</span>
                </div>
                <div class="card-text">${exercise.text}</div>
            `;

            card.addEventListener('click', () => toggleExercise(exercise, card));
            exercisesContainer.appendChild(card);
        });
    }

    function toggleExercise(exercise, cardElement) {
        const index = selectedExercises.findIndex(e => e.id === exercise.id);

        if (index > -1) {
            // Удаляем, если уже выбрано
            selectedExercises.splice(index, 1);
            cardElement.classList.remove('selected');
        } else {
            // Добавляем, если еще не выбрано
            selectedExercises.push(exercise);
            cardElement.classList.add('selected');
        }
        
        updateUI();
    }

    function updateUI() {
        const currentScore = selectedExercises.reduce((sum, ex) => sum + ex.points, 0);
        currentScoreEl.textContent = currentScore;
        
        const progress = (currentScore / allData.targetScore) * 100;
        progressFillEl.style.width = `${Math.min(progress, 100)}%`;
        
        // Обновляем список выбранных
        selectedListContainer.innerHTML = selectedExercises.map(ex => 
            `<div>${ex.text} <small>(${ex.points} балл.)</small></div>`
        ).join('');

        // Активируем/деактивируем кнопку
        if (currentScore >= allData.targetScore) {
            generateBtn.disabled = false;
        } else {
            generateBtn.disabled = true;
        }
    }

    generateBtn.addEventListener('click', () => {
        const exerciseIds = selectedExercises.map(ex => ex.id);
        const encodedData = btoa(JSON.stringify(exerciseIds)); // Кодируем в Base64
        const url = `${window.location.origin}/worksheet.html?data=${encodedData}`;
        
        generatedLinkInput.value = url;
        linkContainer.style.display = 'block';
    });

    copyLinkBtn.addEventListener('click', () => {
        generatedLinkInput.select();
        document.execCommand('copy');
        copyLinkBtn.textContent = 'Скопировано!';
        setTimeout(() => {
            copyLinkBtn.textContent = 'Копировать';
        }, 2000);
    });

    loadData();
});