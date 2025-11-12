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
    const backToSelectionBtn = document.getElementById('back-to-selection');
    const worksheetDate = document.getElementById('worksheet-date');
    const pageTitle = document.getElementById('page-title');
    const codewordInput = document.getElementById('codeword-input');
    const loadExercisesBtn = document.getElementById('load-exercises-btn');
    const loadingStatus = document.getElementById('loading-status');
    const instructions = document.getElementById('instructions');

    let allData = null;
    let selectedExercises = [];

    // Загрузка данных из JSON на основе кодового слова
    async function loadData(codeword = '') {
        try {
            loadingStatus.style.display = 'block';
            exercisesContainer.innerHTML = '';
            
            let dataPath;
            if (codeword.trim() === '') {
                // Если кодовое слово не введено, используем стандартный файл
                dataPath = 'data/exercises.json';
            } else {
                // Используем файл с кодовым словом
                dataPath = `data/exercises-${codeword}.json`;
            }
            
            const response = await fetch(dataPath);
            
            if (!response.ok) {
                throw new Error(`Файл не найден: ${dataPath}`);
            }
            
            allData = await response.json();
            loadingStatus.style.display = 'none';
            instructions.style.display = 'block';
            initializeApp();
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
            loadingStatus.style.display = 'none';
            exercisesContainer.innerHTML = `<p>Не удалось загрузить задания для кодового слова "${codeword}". Проверьте правильность кодового слова или попробуйте другой.</p>`;
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

            let cardContent = `
                <div class="card-header">
                    <span class="card-category" style="background-color: ${category.color}">${category.name}</span>
                    <span class="card-points">${exercise.points} балл.</span>
                </div>
                <div class="card-text">${exercise.text}</div>
            `;
            
            // Добавляем изображение для графических заданий
            if (exercise.type === 'graphic' && exercise.image) {
                cardContent += `<div class="card-image"><img src="${exercise.image}" alt="${exercise.text}" /></div>`;
            }
            
            card.innerHTML = cardContent;

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
        
        // Вычисляем оптимальное количество колонок в зависимости от количества заданий
        const exerciseCount = selectedExercises.length;
        let columnsCount;
        
        if (exerciseCount <= 2) {
            columnsCount = 1;
        } else if (exerciseCount <= 6) {
            columnsCount = 2;
        } else if (exerciseCount <= 12) {
            columnsCount = 3;
        } else {
            columnsCount = 4;
        }
        
        // Устанавливаем количество колонок для сетки
        exercisesWorksheet.style.gridTemplateColumns = `repeat(${columnsCount}, 1fr)`;
        
        // Генерируем HTML для заданий
        exercisesWorksheet.innerHTML = selectedExercises.map((ex, index) => {
            let exerciseContent = `
                <div class="worksheet-item">
                    <span class="item-number">${index + 1}.</span>
                    <span class="item-text">${ex.text}</span>
            `;
            
            // Добавляем изображение для графических заданий
            if (ex.type === 'graphic' && ex.image) {
                exerciseContent += `<div class="exercise-image"><img src="${ex.image}" alt="${ex.text}" /></div>`;
            }
            
            exerciseContent += `
                    <span class="answer">Ответ: ${ex.answer}</span>
                </div>
            `;
            
            return exerciseContent;
        }).join('');
        
        // Показываем контейнер с рабочим листом
        worksheetContainer.style.display = 'block';
    });

    backToSelectionBtn.addEventListener('click', () => {
        worksheetContainer.style.display = 'none';
    });

    // Обработчик для кнопки загрузки упражнений
    loadExercisesBtn.addEventListener('click', () => {
        const codeword = codewordInput.value.trim();
        loadData(codeword);
    });

    // Обработчик для нажатия Enter в поле ввода кодового слова
    codewordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const codeword = codewordInput.value.trim();
            loadData(codeword);
        }
    });

    // Изначально скрываем инструкции до загрузки данных
    instructions.style.display = 'none';
});