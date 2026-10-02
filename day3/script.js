let notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study" },
    { id: 3, text: "Email the project report to Grace", category: "work" },
    { id: 4, text: "Revise JavaScript arrays", category: "study" },
    { id: 5, text: "Call mum", category: "personal" },
  ];
  
  function searchNotes(word) {
    return notes.filter((note) =>
      note.text.toLowerCase().includes(word.toLowerCase())
    );
  }
  
  console.log(searchNotes("Day 3"));

  
  console.log(searchNotes("pizza"));

  
  function longestNote() {
    if (notes.length === 0) {
      return null;
    }
  
    let longest = notes[0];
  
    for (let note of notes) {
      if (note.text.length > longest.text.length) {
        longest = note;
      }
    }
  
    return longest;
  }
  
  console.log(longestNote());

  
  let savedNotes = notes;
  notes = [];
  
  console.log(longestNote());
  
  
  notes = savedNotes;
  
  
  function countByCategory() {
    let counts = {};
  
    for (let note of notes) {
      if (counts[note.category]) {
        counts[note.category]++;
      } else {
        counts[note.category] = 1;
      }
    }
  
    return counts;
  }
  
  console.log(countByCategory());
  
  
  savedNotes = notes;
  notes = [];
  
  console.log(countByCategory());

  
  notes = savedNotes;
  
  
  function getSummary() {
    let counts = countByCategory();
    let word = notes.length === 1 ? "note" : "notes";
  
    return `${notes.length} ${word}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0} study.`;
  }
  
  console.log(getSummary());
  
  
  savedNotes = notes;
  notes = [
    { id: 1, text: "Test note", category: "personal" },
  ];
  
  console.log(getSummary());

  
  notes = savedNotes;
  
  
  function isDuplicate(text) {
    return notes.some(
      (note) => note.text.trim().toLowerCase() === text.trim().toLowerCase()
    );
  }
  
  console.log(isDuplicate("Call mum"));
 
  console.log(isDuplicate("Buy a new car"));
  
  
  
  function addNote(text, category) {
    text = text.trim();
  
    if (text.length < 1 || text.length > 200) {
      console.log("Note must be between 1 and 200 characters.");
      return false;
    }
  
    if (isDuplicate(text)) {
      console.log("Note already exists.");
      return false;
    }
  
    if (!["personal", "work", "study"].includes(category)) {
      console.log("Invalid category.");
      return false;
    }
  
    let newNote = {
      id: notes.length + 1,
      text: text,
      category: category,
    };
  
    notes.push(newNote);
  
    return true;
  }
  
  console.log(addNote("Buy a new notebook", "personal"));

  
  console.log(addNote("Call mum", "personal"));
  
  
  console.log(addNote("Learn React", "coding"));
  