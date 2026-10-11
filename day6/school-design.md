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