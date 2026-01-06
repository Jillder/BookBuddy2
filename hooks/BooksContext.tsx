import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Book = {
  id: number;
  title: string;
  author: string;
  image?: string;
  genre?: string;
};

type BooksContextType = {
  books: Book[];
  addBook: (title: string, author: string, image?: string, genre?: string) => void;
  deleteBook: (id: number) => void;
  updateBook: (id: number, updatedData: Partial<Book>) => void;
};

const BooksContext = createContext<BooksContextType>({
  books: [],
  addBook: () => {},
  deleteBook: () => {},
  updateBook: () => {},
});

export function BooksProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);

  // 🔹 Cargar libros guardados al iniciar la app
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const storedBooks = await AsyncStorage.getItem("books");
      if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
      }
    } catch (error) {
      console.log("Error cargando libros:", error);
    }
  };

  const saveBooks = async (booksToSave: Book[]) => {
    try {
      await AsyncStorage.setItem("books", JSON.stringify(booksToSave));
    } catch (error) {
      console.log("Error guardando libros:", error);
    }
  };

  const addBook = async (title: string, author: string, image?: string, genre?: string) => {
    const newBook: Book = {
      id: Date.now(),
      title,
      author,
      image,
      genre,
    };

    const updated = [...books, newBook];
    setBooks(updated);
    await saveBooks(updated);
  };

  const deleteBook = async (id: number) => {
    const updated = books.filter((b) => b.id !== id);
    setBooks(updated);
    await saveBooks(updated);
  };

  const updateBook = async (id: number, updatedData: Partial<Book>) => {
    const updated = books.map((book) =>
      book.id === id ? { ...book, ...updatedData } : book
    );
    setBooks(updated);
    await saveBooks(updated);
  };

  return (
    <BooksContext.Provider value={{ books, addBook, deleteBook, updateBook }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  return useContext(BooksContext);
}
