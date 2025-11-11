document.addEventListener('DOMContentLoaded', () => {
    const worksheetContent = document.getElementById('exercises-worksheet');
    const toggleAnswersBtn = document.getElementById('toggle-answers');
    const dateInput = document.getElementById('worksheet-date');
    
    // Устанавливаем текущую дату в поле ввода
    dateInput.valueAsDate = new Date();

    async function renderWorksheet() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');

        if (!encodedData) {
            worksheetContent.innerHTML = "<p>Ошибка: ссылка некорректна или не содержит данных о заданиях.</p>";
            return;
        }

        let exerciseIds;
        try {
            exerciseIds = JSON.parse(atob(encodedData)); // Декодируем из Base64
        } catch (e) {
            worksheetContent.innerHTML = "<p>Ошибка: не удалось расшифровать данные из ссылки.</p>";
            return;
        }
        
        try {
            const response = await fetch('data/exercises.json');
            const allData = await response.json();
            const exercisesToRender = allData.exercises.filter(ex => exerciseIds.includes(ex.id));

            if (exercisesToRender.length === 0) {
                worksheetContent.innerHTML = "<p>По этой ссылке не найдено заданий.</p>";
                return;
            }

            worksheetContent.innerHTML = exercisesToRender.map((ex, index) => `
                <div class="worksheet-item">
                    <span class="item-number">${index + 1}.</span>
                    <span class="item-text">${ex.text}</span>
                    <span class="answer">Ответ: ${ex.answer}</span>
                </div>
            `).join('');

        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
            worksheetContent.innerHTML = "<p>Не удалось загрузить задания для рабочего листа.</p>";
        }
    }

    toggleAnswersBtn.addEventListener('click', () => {
        document.querySelectorAll('.answer').forEach(answer => {
            answer.classList.toggle('visible');
        });
    });

    renderWorksheet();
});