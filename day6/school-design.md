# School Database Design

## Tables

- **Students:** Stores each student's ID, name, and unique email address.
- **Courses:** Stores each course's ID, name, and unique course code.
- **Enrolments:** Connects students to courses using foreign keys. It also stores each student's grade in a course. The combination of `student_id` and `course_id` is unique to prevent duplicate enrolments.

## Relationships

- **Students to enrolments:** One-to-many, because one student can enrol in multiple courses, but each enrolment belongs to one student.
- **Courses to enrolments:** One-to-many, because one course can have many students, but each enrolment refers to one course.
- **Students to courses:** Many-to-many, because students can take multiple courses and courses can have multiple students. The enrolments table connects these two tables and stores the grade for each student-course combination.

## Index

I would create an index on `enrolments(course_id)` to speed up queries that find students enrolled in a particular course or count enrolments per course.

## SQL vs NoSQL

I would choose SQL for this school system because students, courses, and enrolments have clear relationships. SQL supports primary keys, foreign keys, unique constraints, and joins, helping maintain data accuracy and retrieve related information. NoSQL can also store this information, but a relational database is a more natural fit for this structured data.
## Constraints and Testing

The database uses a UNIQUE constraint on `(student_id, course_id)` in the enrolments table to prevent a student from enrolling in the same course more than once. I tested this by attempting a duplicate enrolment, and SQLite rejected it.

The students table also enforces unique email addresses. A duplicate email insertion was rejected, confirming that the constraint works.

Foreign keys connect enrolments to existing students and courses. I enabled foreign-key enforcement using `PRAGMA foreign_keys = ON;` and tested invalid student and course IDs. SQLite rejected both insertions because the referenced records did not exist.

## Index

I created an index named `idx_enrolments_course_id` on `enrolments(course_id)`. This can improve the performance of queries that search for students enrolled in a particular course or count enrolments per course. I verified that the index exists using `PRAGMA index_list('enrolments');`.