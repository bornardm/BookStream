CREATE TABLE IF NOT EXISTS BOOKS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT ,
  author TEXT,
  publicationDate DATE ,
  publisher TEXT ,
  pageNumber INTEGER ,
  isbn TEXT,
  summary TEXT,
  status INTEGER NOT NULL DEFAULT 1,
  borrowed BOOLEAN  ,
  toExchange BOOLEAN ,
  rating INTEGER ,
  readingStartDate DATE,
  readingEndDate DATE,
  imagePath TEXT,
  series TEXT,
  volume INTEGER,
  comment TEXT,
  categories TEXT,
  language TEXT,
  CONSTRAINT ck_status CHECK (status >= 0 AND status <= 3),
  CONSTRAINT ck_rating CHECK (rating >= 0 AND rating <= 10)
);


INSERT INTO BOOKS (title, author, publicationDate, publisher, pageNumber, isbn, summary, status, borrowed, toExchange, rating, readingStartDate, readingEndDate, imagePath, series, volume, comment, categories, language)
VALUES
('1984', 'George Orwell', '1949-06-08', 'Secker & Warburg', 328, '9780451524935', 'A dystopian social science fiction novel.', 1, 0, 0, 8, '2024-03-01', '2024-03-18', 'path/to/image3.jpg', 'Heartstopper', 2, 'A thought-provoking novel.', 'Fiction, Dystopian', 'English'),
(NULL, 'F. Scott Fitzgerald', 'Harper Lee', 'Charles Scribners Sons', 218, '9780743273565', 'A novel about the American dream.', 1, 0, 0, 9, '2024-01-01', '2024-01-15', 'path/to/image1.jpg', "SerieA", 1, 'A classic novel.', 'Fiction, Classic', 'English'),
('To Kill a Mockingbird', NULL, '1960-07-11', 'J.B. Lippincott & Co.', 281, '9780061120084', 'A novel about racial injustice in the Deep South.', 2, 0, 0, 10, '2024-02-01', '2024-02-20', 'path/to/image2.jpg', "SerieB", 1, 'An impactful novel.', 'Fiction, Classic', 'English'),
('Pride and Prejudice', 'Jane Austen', NULL, 'T. Egerton', 279, '9781503290563', 'A romantic novel about manners and marriage.', 1, 0, 0, 9, '2024-04-01', '2024-04-20', 'path/to/image4.jpg', NULL, 1, 'A delightful novel.', 'Fiction, Romance', 'English'),
('Moby-Dick', 'Herman Melville', '1851-11-14', NULL, 635, '9781503280786', 'A novel about the voyage of the whaling ship Pequod.', 0, 0, 0, 7, '2024-05-01', '2024-05-30', 'path/to/image5.jpg', NULL, 1, 'A challenging novel.', 'Fiction, Adventure', 'English'),
('War and Peace', 'Leo Tolstoy', '1869-01-01', 'The Russian Messenger', NULL, '9781400079988', 'A historical novel about the French invasion of Russia.', 0, 0, 0, 10, '2024-06-01', '2024-07-31', 'path/to/image6.jpg', NULL, 1, 'A monumental novel.', 'Fiction, Historical', 'Russian'),
('The Catcher in the Rye', 'J.D. Salinger', '1951-07-16', 'Little, Brown and Company', 234, NULL, 'A novel about teenage rebellion and alienation.', 3, 1, 0, 8, '2024-08-01', '2024-08-10', 'path/to/image7.jpg', NULL, 1, 'A controversial novel.', 'Fiction, Young Adult', 'English'),
('The Hobbit', 'J.R.R. Tolkien', '1937-09-21', 'George Allen & Unwin', 310, '9780547928227', 3, 1, 0, 0, 10, '2024-09-01', '2024-09-20', 'path/to/image8.jpg', 'The Lord of the Rings', 1, 'A wonderful novel.', 'Fiction, Fantasy', 'English'),
('Crime and Punishment', 'Fyodor Dostoevsky', '1866-01-01', 'The Russian Messenger', 671, '9780486415871', 'A novel about the mental anguish of a young man planning a crime.', 2, 0, 0, 9, '2024-10-01', '2024-10-25', 'path/to/image9.jpg', NULL, 1, 'A psychological novel.', 'Fiction, Psychological', 'Russian'),
('The Brothers Karamazov', 'Fyodor Dostoevsky', '1880-01-01', 'The Russian Messenger', 796, '9780374528379', 'A novel about the moral struggles of a family.', 2, NULL, 0, 10, '2024-11-01', '2024-12-15', 'path/to/image10.jpg', NULL, 1, 'An intense novel.', 'Fiction, Philosophical', 'Russian'),
('The Little Prince', 'Antoine de Saint-Exupéry', '1943-04-06', 'Reynal & Hitchcock', 96, '9780156012195', 'A young prince explores the universe.', 0, 0, NULL, 9, '2024-01-01', '2024-01-05', 'path/to/image11.jpg', NULL, NULL, 'A philosophical tale.', 'Fiction, Children', 'French'),
('Brave New World', 'Aldous Huxley', '1932-01-01', 'Chatto & Windus', 268, '9780060850524', 'A dystopian novel set in a future society.', 2, 0, 0, NULL, '2024-02-01', '2024-02-15', 'path/to/image12.jpg', NULL, 1, 'A disturbing vision of the future.', 'Fiction, Dystopian', 'English'),
('The Alchemist', 'Paulo Coelho', '1988-01-01', 'HarperOne', 208, '9780061122415', 'A journey of self-discovery.', 1, 0, 0, 10, NULL, '2024-03-10', 'path/to/image13.jpg', NULL, 1, 'An inspirational novel.', 'Fiction, Adventure', 'Portuguese'),
('Harry Potter and the Philosophers Stone', 'J.K. Rowling', '1997-06-26', 'Bloomsbury', 223, '9780747532699', 'A young boy discovers he is a wizard.', 2, 0, 1, 10, '2024-04-01', NULL,'path/img.jpg', 'Harry Potter', 1, 'A magical story.', 'Fiction, Fantasy', 'English'),
('The Odyssey', 'Homer', '-800-01-01', 'Various', 541, '9780140268867', 'An epic Greek poem about Odysseuss journey home.', 0, 0, 0, 9, NULL, '2024-05-10', 'path/to/image14.jpg', NULL, 1, 'A classic epic.', 'Fiction, Epic', 'Greek'),
('The Divine Comedy', 'Dante Alighieri', '1320-01-01', 'Various', 798, '9780142437223', 'A journey through Hell, Purgatory, and Paradise.', 1, 0, 0, 10, '2024-06-01', '2024-07-01', 'path/to/image15.jpg', "SerieK", NULL, 'A spiritual epic.', 'Fiction, Poetry', 'Italian'),
('Hamlet', 'William Shakespeare', '1600-01-01', NULL, 160, '9780743477123', 'A tragedy about Prince Hamlet of Denmark.', 0, 0, 0, 8, '2024-08-01', '2024-08-05', 'path/to/image16.jpg', NULL, 1, NULL, 'Fiction, Drama', 'English'),
('The Iliad', 'Homer', '-750-01-01', 'Various', 683, '9780140275360', 'An epic Greek poem about the Trojan War.', 1, 0, 0, 9, '2024-09-01', NULL, 'path/to/image17.jpg', NULL, 1, 'A classic epic.', NULL, 'Greek'),
('Don Quixote', 'Miguel de Cervantes', '1605-01-01', 'Francisco de Robles', 982, '9780060934347', 'A story about a man who becomes a knight.', 0, 0, 0, 8, '2024-10-01', '2024-10-30', 'path/to/image18.jpg', NULL, 1, 'A humorous novel.', 'Fiction, Adventure', NULL),
('Don Quixote3', 'Miguel de Cervantes', '1605-01-01', 'Francisco de Robles', 982, '9780060934347', 'A story about a man who becomes a knight.', 0, 0, 0, 8, NULL, NULL, 'path/to/image18.jpg', NULL, 1, 'A humorous novel.', 'Fiction, Adventure', NULL),
('Don Quixote4', 'Miguel de Cervantes', '1605-01-01', 'Francisco de Robles', 982, '9780060934347', 'A story about a man who becomes a knight.', 0, 0, 0, 8, NULL, NULL, 'path/to/image18.jpg', NULL, 1, 'A humorous novel.', 'Fiction, Adventure', NULL),
('Don Quixote5', 'Miguel de Cervantes', '1605-01-01', 'Francisco de Robles', 982, '9780060934347', 'A story about a man who becomes a knight.', 0, 0, 0, 8, NULL, NULL, 'path/to/image18.jpg', NULL, 1, 'A humorous novel.', 'Fiction, Adventure', NULL),
('Don Quixote6', 'Miguel de Cervantes', '1605-01-01', 'Francisco de Robles', 982, '9780060934347', 'A story about a man who becomes a knight.', 0, 0, 0, 8, NULL, NULL, 'path/to/image18.jpg', NULL, 1, 'A humorous novel.', 'Fiction, Adventure', NULL);


