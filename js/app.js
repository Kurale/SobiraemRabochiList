document.addEventListener('DOMContentLoaded', () => {
    const exercisesContainer = document.getElementById('exercises-container');
    const selectedListContainer = document.getElementById('selected-exercises-list');
    const currentScoreEl = document.getElementById('current-score');
    const targetScoreEl = document.getElementById('target-score');
    const targetScoreSummaryEl = document.getElementById('target-score-summary');
    const progressFillEl = document.getElementById('progress-fill');
    const generateBtn = document.getElementById('generate-btn');
    const worksheetContainer = document.getElementById('worksheet-container');
    const exercisesWorksheet = document.getElementById('exercises-worksheet');
    const toggleAnswersBtn = document.getElementById('toggle-answers');
    const backToSelectionBtn = document.getElementById('back-to-selection');
    const worksheetDate = document.getElementById('worksheet-date');
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
        // Устанавливаем текущую дату в поле ввода
        worksheetDate.valueAsDate = new Date();
        
        // Генерируем HTML для заданий
        exercisesWorksheet.innerHTML = selectedExercises.map((ex, index) => `
            <div class="worksheet-item">
                <span class="item-number">${index + 1}.</span>
                <span class="item-text">${ex.text}</span>
                <span class="answer">Ответ: ${ex.answer}</span>
            </div>
        `).join('');
        
        // Показываем контейнер с рабочим листом
        worksheetContainer.style.display = 'block';
    });

    toggleAnswersBtn.addEventListener('click', () => {
        document.querySelectorAll('.answer').forEach(answer => {
            answer.classList.toggle('visible');
        });
    });

    backToSelectionBtn.addEventListener('click', () => {
        worksheetContainer.style.display = 'none';
    });

    loadData();
});