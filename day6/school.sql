CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);
INSERT INTO students (id, name, email) VALUES
(1, 'Trizah Biwott', 'trizah@example.com'),
(2, 'Grace Wanjiku', 'grace@example.com'),
(3, 'Brian Otieno', 'brian@example.com') ,
(4, 'Mary Njeri', 'mary@example.com');
CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL,
    course_code TEXT NOT NULL UNIQUE
);
INSERT INTO courses (id, course_name, course_code) VALUES
(1, 'Database Systems', 'DBS101'),
(2, 'Web Development', 'WEB102'),
(3, 'Software Engineering', 'SWE103');

CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE (student_id, course_id)
);
INSERT INTO enrolments (student_id, course_id, grade) VALUES
(1, 1, 'A'),
(1, 2, 'B'),
(2, 1, 'B'),
(2, 3, 'A'),
(3, 2, 'A');

SELECT s.name AS student_name, c.course_name, e.grade
FROM students AS s
JOIN enrolments AS e ON e.student_id = s.id
JOIN courses AS c ON c.id = e.course_id
WHERE s.name = 'Trizah Biwott';

SELECT c.course_name, s.name AS student_name, e.grade
FROM courses AS c
JOIN enrolments AS e ON e.course_id = c.id
JOIN students AS s ON s.id = e.student_id
WHERE c.course_name = 'Database Systems';

SELECT c.course_name, COUNT(e.student_id) AS student_count
FROM courses AS c
LEFT JOIN enrolments AS e ON e.course_id = c.id
GROUP BY c.id, c.course_name;

SELECT s.id, s.name, s.email
FROM students AS s
LEFT JOIN enrolments AS e ON e.student_id = s.id
WHERE e.student_id IS NULL;

SELECT s.name, c.course_name, e.grade
FROM enrolments AS e
JOIN students AS s ON s.id = e.student_id
JOIN courses AS c ON c.id = e.course_id
WHERE e.student_id = 1 AND e.course_id = 2;

UPDATE enrolments
SET grade = 'A'
WHERE student_id = 1 AND course_id = 2;
