const STORAGE_KEY = "mlSummer2026Progress";

const roadmapData = [
  {
    title: "Блок 1. Python для Data Science",
    topics: ["Python основы", "Jupyter Notebook", "NumPy", "Pandas", "Matplotlib", "Seaborn"]
  },
  {
    title: "Блок 2. Математика и статистика",
    topics: ["Описательная статистика", "Теория вероятностей", "Распределения", "Корреляция", "Проверка гипотез", "A/B тестирование"]
  },
  {
    title: "Блок 3. Классический Machine Learning",
    topics: ["Подготовка данных", "Train/Test Split", "Метрики качества", "Линейная регрессия", "Логистическая регрессия", "KNN", "Naive Bayes", "Decision Tree", "Random Forest", "Gradient Boosting", "XGBoost"]
  },
  {
    title: "Блок 4. Практика Data Science",
    topics: ["Feature Engineering", "Работа с пропусками", "Работа с категориальными признаками", "Отбор признаков", "Анализ данных", "Визуализация данных"]
  },
  {
    title: "Блок 5. Kaggle",
    topics: ["Titanic", "House Prices", "Spaceship Titanic", "Дополнительное соревнование"]
  },
  {
    title: "Блок 6. Deep Learning",
    topics: ["Основы нейронных сетей", "PyTorch", "Полносвязные сети", "CNN", "Transfer Learning"]
  },
  {
    title: "Блок 7. Современный AI",
    topics: ["NLP", "Transformers", "LLM", "RAG", "AI-агенты"]
  },
  {
    title: "Блок 8. Итоговый проект",
    topics: ["EDA", "Подготовка данных", "Обучение модели", "Оценка качества", "Документация", "README", "Публикация на GitHub"]
  }
];

const defaultProjects = [
  "Mini Python DS Project",
  "Titanic Kaggle",
  "House Prices Kaggle",
  "Classification Project",
  "Final ML Project"
];

const projectStages = ["EDA", "preprocessing", "model training", "evaluation", "README", "GitHub published"];
const skills = ["Python", "NumPy", "Pandas", "Matplotlib", "Statistics", "Scikit-Learn", "SQL", "Kaggle", "PyTorch", "GitHub Portfolio"];

let state = loadState();

function createDefaultState() {
  return {
    theme: "light",
    topics: {},
    dailyEntries: [],
    projects: defaultProjects.map((name) => ({
      name,
      status: "planned",
      github: "",
      description: "",
      stages: Object.fromEntries(projectStages.map((stage) => [stage, false]))
    })),
    skills: Object.fromEntries(skills.map((skill) => [skill, 0]))
  };
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const baseState = createDefaultState();

  if (!saved) {
    return baseState;
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      ...baseState,
      ...parsed,
      topics: { ...baseState.topics, ...(parsed.topics || {}) },
      skills: { ...baseState.skills, ...(parsed.skills || {}) },
      projects: mergeProjects(parsed.projects || baseState.projects)
    };
  } catch {
    return baseState;
  }
}

function mergeProjects(savedProjects) {
  return defaultProjects.map((name) => {
    const saved = savedProjects.find((project) => project.name === name) || {};
    return {
      name,
      status: saved.status || "planned",
      github: saved.github || "",
      description: saved.description || "",
      stages: { ...Object.fromEntries(projectStages.map((stage) => [stage, false])), ...(saved.stages || {}) }
    };
  });
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function topicKey(blockIndex, topicIndex) {
  return `block-${blockIndex}-topic-${topicIndex}`;
}

function getTopicState(blockIndex, topicIndex) {
  const key = topicKey(blockIndex, topicIndex);
  if (!state.topics[key]) {
    state.topics[key] = {
      done: false,
      status: "not started",
      note: "",
      completedDate: ""
    };
  }
  return state.topics[key];
}

function getRoadmapStats() {
  const total = roadmapData.reduce((sum, block) => sum + block.topics.length, 0);
  let done = 0;

  roadmapData.forEach((block, blockIndex) => {
    block.topics.forEach((_, topicIndex) => {
      if (getTopicState(blockIndex, topicIndex).done) {
        done += 1;
      }
    });
  });

  return {
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0
  };
}

function getBlockStats(blockIndex) {
  const block = roadmapData[blockIndex];
  const done = block.topics.filter((_, topicIndex) => getTopicState(blockIndex, topicIndex).done).length;
  const total = block.topics.length;
  return {
    done,
    total,
    percent: Math.round((done / total) * 100)
  };
}

function getCurrentBlockTitle() {
  const current = roadmapData.find((_, index) => getBlockStats(index).percent < 100);
  return current ? current.title.replace("Блок ", "") : "Все блоки завершены";
}

function calculateStreak() {
  const dates = [...new Set(state.dailyEntries.map((entry) => entry.date))].sort().reverse();
  if (!dates.length) {
    return 0;
  }

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const date of dates) {
    const currentDate = formatDateValue(cursor);
    if (date === currentDate) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (streak === 0) {
      cursor.setDate(cursor.getDate() - 1);
      if (date === formatDateValue(cursor)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return streak;
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateRu(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(year, month - 1, day));
}

function renderAll() {
  applyTheme();
  renderHeader();
  renderOverview();
  renderRoadmap();
  renderDailyTracker();
  renderProjects();
  renderSkills();
}

function renderHeader() {
  const stats = getRoadmapStats();
  document.getElementById("headerProgress").textContent = `${stats.percent}%`;
  document.getElementById("headerTopics").textContent = `${stats.done} / ${stats.total}`;
  document.getElementById("headerStreak").textContent = calculateStreak();
}

function renderOverview() {
  const stats = getRoadmapStats();
  const completedProjects = state.projects.filter((project) => project.status === "done").length;
  const kaggleDone = ["Titanic", "House Prices", "Spaceship Titanic", "Дополнительное соревнование"].filter((topic) => {
    const blockIndex = 4;
    const topicIndex = roadmapData[blockIndex].topics.indexOf(topic);
    return topicIndex >= 0 && getTopicState(blockIndex, topicIndex).done;
  }).length;
  const githubPublished = state.projects.filter((project) => project.stages["GitHub published"]).length;

  const cards = [
    ["Общий прогресс", `${stats.percent}%`],
    ["Текущий блок", getCurrentBlockTitle()],
    ["Завершено тем", `${stats.done} из ${stats.total}`],
    ["Завершено проектов", `${completedProjects} из ${state.projects.length}`],
    ["Kaggle-задачи", `${kaggleDone} из 4`],
    ["GitHub-портфолио", `${githubPublished} публикаций`]
  ];

  document.getElementById("overviewCards").innerHTML = cards.map(([title, value]) => `
    <article class="card">
      <p class="muted">${title}</p>
      <span class="card-value">${value}</span>
    </article>
  `).join("");
}

function renderRoadmap() {
  const roadmap = document.getElementById("roadmap");
  roadmap.innerHTML = roadmapData.map((block, blockIndex) => {
    const stats = getBlockStats(blockIndex);
    const topics = block.topics.map((topic, topicIndex) => {
      const topicState = getTopicState(blockIndex, topicIndex);
      return `
        <div class="topic-row">
          <input type="checkbox" data-topic-done="${blockIndex}:${topicIndex}" ${topicState.done ? "checked" : ""} aria-label="Выполнено">
          <div class="topic-name">${topic}</div>
          <select data-topic-status="${blockIndex}:${topicIndex}">
            <option value="not started" ${topicState.status === "not started" ? "selected" : ""}>not started</option>
            <option value="in progress" ${topicState.status === "in progress" ? "selected" : ""}>in progress</option>
            <option value="done" ${topicState.status === "done" ? "selected" : ""}>done</option>
          </select>
          <input type="text" data-topic-note="${blockIndex}:${topicIndex}" value="${escapeAttribute(topicState.note)}" placeholder="Короткая заметка">
          <input type="date" data-topic-date="${blockIndex}:${topicIndex}" value="${topicState.completedDate}">
        </div>
      `;
    }).join("");

    return `
      <article class="block ${stats.percent < 100 ? "open" : ""}">
        <button class="block-summary" type="button" data-block-toggle="${blockIndex}">
          <div>
            <h3>${block.title}</h3>
            <div class="progress-track"><div class="progress-fill" style="width: ${stats.percent}%"></div></div>
          </div>
          <div class="block-meta">${stats.percent}% · ${stats.done}/${stats.total}</div>
        </button>
        <div class="topics">${topics}</div>
      </article>
    `;
  }).join("");

  bindRoadmapEvents();
}

function bindRoadmapEvents() {
  document.querySelectorAll("[data-block-toggle]").forEach((button) => {
    button.addEventListener("click", () => button.closest(".block").classList.toggle("open"));
  });

  document.querySelectorAll("[data-topic-done]").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const [blockIndex, topicIndex] = event.target.dataset.topicDone.split(":").map(Number);
      const topic = getTopicState(blockIndex, topicIndex);
      topic.done = event.target.checked;
      topic.status = event.target.checked ? "done" : topic.status === "done" ? "not started" : topic.status;
      topic.completedDate = event.target.checked && !topic.completedDate ? formatDateValue(new Date()) : topic.completedDate;
      saveState();
      renderAll();
    });
  });

  document.querySelectorAll("[data-topic-status]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const [blockIndex, topicIndex] = event.target.dataset.topicStatus.split(":").map(Number);
      const topic = getTopicState(blockIndex, topicIndex);
      topic.status = event.target.value;
      topic.done = event.target.value === "done";
      topic.completedDate = topic.done && !topic.completedDate ? formatDateValue(new Date()) : topic.completedDate;
      saveState();
      renderAll();
    });
  });

  document.querySelectorAll("[data-topic-note]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const [blockIndex, topicIndex] = event.target.dataset.topicNote.split(":").map(Number);
      getTopicState(blockIndex, topicIndex).note = event.target.value;
      saveState();
    });
  });

  document.querySelectorAll("[data-topic-date]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const [blockIndex, topicIndex] = event.target.dataset.topicDate.split(":").map(Number);
      getTopicState(blockIndex, topicIndex).completedDate = event.target.value;
      saveState();
    });
  });
}

function renderDailyTracker() {
  const today = formatDateValue(new Date());
  document.getElementById("todayDate").textContent = formatDateRu(today);
  const history = document.getElementById("dailyHistory");
  const recentEntries = state.dailyEntries.slice(0, 7);

  history.innerHTML = recentEntries.length ? recentEntries.map((entry) => `
    <article class="history-item">
      <p><strong>${formatDateRu(entry.date)}</strong> · ${entry.hours || 0} ч.</p>
      <p><strong>Изучал:</strong> ${escapeHtml(entry.learned || "—")}</p>
      <p><strong>Практика:</strong> ${escapeHtml(entry.practice || "—")}</p>
      <p><strong>Непонятно:</strong> ${escapeHtml(entry.questions || "—")}</p>
    </article>
  `).join("") : `<div class="empty-state">Пока нет записей.</div>`;
}

function bindDailyForm() {
  document.getElementById("dailyForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const today = formatDateValue(new Date());
    const entry = {
      date: today,
      hours: document.getElementById("dailyHours").value,
      learned: document.getElementById("dailyLearned").value.trim(),
      practice: document.getElementById("dailyPractice").value.trim(),
      questions: document.getElementById("dailyQuestions").value.trim()
    };

    state.dailyEntries = state.dailyEntries.filter((item) => item.date !== today);
    state.dailyEntries.unshift(entry);
    saveState();
    event.target.reset();
    renderAll();
  });
}

function renderProjects() {
  document.getElementById("projects").innerHTML = state.projects.map((project, projectIndex) => `
    <article class="project-card">
      <h3>${project.name}</h3>
      <label>
        <span>Статус</span>
        <select data-project-status="${projectIndex}">
          <option value="planned" ${project.status === "planned" ? "selected" : ""}>planned</option>
          <option value="in progress" ${project.status === "in progress" ? "selected" : ""}>in progress</option>
          <option value="done" ${project.status === "done" ? "selected" : ""}>done</option>
        </select>
      </label>
      <label>
        <span>Ссылка на GitHub</span>
        <input type="url" data-project-github="${projectIndex}" value="${escapeAttribute(project.github)}" placeholder="https://github.com/...">
      </label>
      <label>
        <span>Краткое описание</span>
        <textarea rows="3" data-project-description="${projectIndex}">${escapeHtml(project.description)}</textarea>
      </label>
      <div class="stages">
        ${projectStages.map((stage) => `
          <label class="checkbox-line">
            <input type="checkbox" data-project-stage="${projectIndex}:${stage}" ${project.stages[stage] ? "checked" : ""}>
            ${stage}
          </label>
        `).join("")}
      </div>
    </article>
  `).join("");

  bindProjectEvents();
}

function bindProjectEvents() {
  document.querySelectorAll("[data-project-status]").forEach((select) => {
    select.addEventListener("change", (event) => {
      state.projects[event.target.dataset.projectStatus].status = event.target.value;
      saveState();
      renderOverview();
    });
  });

  document.querySelectorAll("[data-project-github]").forEach((input) => {
    input.addEventListener("input", (event) => {
      state.projects[event.target.dataset.projectGithub].github = event.target.value;
      saveState();
    });
  });

  document.querySelectorAll("[data-project-description]").forEach((textarea) => {
    textarea.addEventListener("input", (event) => {
      state.projects[event.target.dataset.projectDescription].description = event.target.value;
      saveState();
    });
  });

  document.querySelectorAll("[data-project-stage]").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const [projectIndex, stage] = event.target.dataset.projectStage.split(":");
      state.projects[projectIndex].stages[stage] = event.target.checked;
      saveState();
      renderOverview();
    });
  });
}

function renderSkills() {
  document.getElementById("skills").innerHTML = skills.map((skill) => {
    const level = state.skills[skill] || 0;
    return `
      <article class="skill-card">
        <div class="skill-header">
          <span>${skill}</span>
          <span>${level}/5</span>
        </div>
        <div class="skill-controls">
          <button class="button secondary" type="button" data-skill-minus="${skill}">-</button>
          <div class="level-dots">${[1, 2, 3, 4, 5].map((dot) => `<span class="level-dot ${dot <= level ? "active" : ""}"></span>`).join("")}</div>
          <button class="button secondary" type="button" data-skill-plus="${skill}">+</button>
        </div>
      </article>
    `;
  }).join("");

  bindSkillEvents();
}

function bindSkillEvents() {
  document.querySelectorAll("[data-skill-minus]").forEach((button) => {
    button.addEventListener("click", () => updateSkill(button.dataset.skillMinus, -1));
  });
  document.querySelectorAll("[data-skill-plus]").forEach((button) => {
    button.addEventListener("click", () => updateSkill(button.dataset.skillPlus, 1));
  });
}

function updateSkill(skill, delta) {
  state.skills[skill] = Math.max(0, Math.min(5, (state.skills[skill] || 0) + delta));
  saveState();
  renderSkills();
}

function bindTools() {
  document.getElementById("themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    saveState();
    applyTheme();
  });

  document.getElementById("exportButton").addEventListener("click", exportProgress);
  document.getElementById("importInput").addEventListener("change", importProgress);
  document.getElementById("resetButton").addEventListener("click", resetProgress);
}

function applyTheme() {
  document.body.classList.toggle("dark", state.theme === "dark");
  document.getElementById("themeToggle").textContent = state.theme === "dark" ? "Светлая тема" : "Темная тема";
}

function exportProgress() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ml-summer-2026-progress.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function importProgress(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      state = {
        ...createDefaultState(),
        ...imported,
        projects: mergeProjects(imported.projects || [])
      };
      saveState();
      renderAll();
    } catch {
      alert("Не удалось импортировать JSON.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function resetProgress() {
  if (!confirm("Сбросить весь прогресс?")) {
    return;
  }
  state = createDefaultState();
  saveState();
  renderAll();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

bindTools();
bindDailyForm();
renderAll();
