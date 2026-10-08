# Library Books API

## Endpoints

### 1. List All Books
- Method: GET
- Path: /api/books
- Description: Returns a list of all books in the library.
- Success status: 200 OK

### 2. Get One Book
- Method: GET
- Path: /api/books/{id}
- Description: Returns one book using its ID.
- Success status: 200 OK

### 3. Create a Book
- Method: POST
- Path: /api/books
- Description: Adds a new book to the library.
- Request body:
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "year": 1958
  }
- Success status: 201 Created

### 4. Update a Book
- Method: PUT
- Path: /api/books/{id}
- Description: Updates an existing book.
- Request body:
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "year": 1958
  }
- Success status: 200 OK

### 5. Delete a Book
- Method: DELETE
- Path: /api/books/{id}
- Description: Deletes a book using its ID.
- Success status: 204 No Content

### 6. List Books by Author
- Method: GET
- Path: /api/books?author=Chinua%20Achebe
- Description: Returns books written by the specified author.
- Success status: 200 OK

## Error Codes

### 400 Bad Request
- Description: The request contains invalid or missing information.
- Example: A client tries to create a book without providing a title or author.

### 404 Not Found
- Description: The requested resource does not exist.
- Example: A client requests /api/books/999 but book ID 999 does not exist.