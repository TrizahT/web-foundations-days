const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");
function updateCounts() {
    const text = noteText.value;
    const characters = text.length;
  
    const words = text.trim() === ""
      ? 0
      : text.trim().split(/\s+/).length;
  
    charCount.textContent = `${characters} / 200 characters`;
    wordCount.textContent = `${words} words`;
  
    charCount.classList.remove("warning", "over");
  
    if (characters > 200) {
      charCount.classList.add("over");
    } else if (characters > 180) {
      charCount.classList.add("warning");
    }
  }
  noteText.addEventListener("input", () => {
    updateCounts();
    localStorage.setItem("noteDraft", noteText.value);
  });
  const savedDraft = localStorage.getItem("noteDraft");

if (savedDraft !== null) {
  noteText.value = savedDraft;
}

updateCounts();
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  
    const isDark = document.body.classList.contains("dark");
  
    if (isDark) {
      themeToggle.textContent = "Light mode";
      localStorage.setItem("theme", "dark");
    } else {
      themeToggle.textContent = "Dark mode";
      localStorage.setItem("theme", "light");
    }
  });
  const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "Light mode";
}
function clearNote() {
    noteText.value = "";
    updateCounts();
    localStorage.removeItem("noteDraft");
  }
  
  clearBtn.addEventListener("click", clearNote);
  
  noteText.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      clearNote();
    }
  });