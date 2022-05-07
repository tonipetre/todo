import { useEffect, useState, useCallback } from "react";
import "./dashboard.css";
import FirestoreService from "../../services/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, logout } from "../../services/auth";
import TodoItem from "../../components/Todo";

function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [toggleEditById, setToggleEditById] = useState("");
  const [editInput, setEditInput] = useState("");

  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");

  const navigate = useNavigate();

  // useEffect(() => {
  //   if (loading) return;
  //   FirebaseService.getFirstBatch(user)
  //     .then((res) => {
  //       setTodos(res.todos);
  //       setLastDocument(res.lastDocument);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }, [user, loading]);

  // useEffect(() => {
  //   if (loading) return;

  //   const q = query(
  //     COLLECTION_REF,
  //     where("author", "==", user.uid),
  //     orderBy("createdAt", "desc")
  //   );

  //   const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //     const data = querySnapshot.docs.map((doc) => {
  //       return {
  //         id: doc.id,
  //         ...doc.data(),
  //       };
  //     });
  //     setTodos(data);
  //   });

  //   return () => unsubscribe();
  // }, [user, loading]);

  useEffect(() => {
    if (loading) return;
    const unsubscribe = FirestoreService.listenToUpdates(
      user,
      (querySnapshot) => {
        const todos = querySnapshot.docs.map((docSnapshot) => {
          return {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          };
        });
        setTodos(todos);
      },
      // (error) => setError("grocery-list-item-get-fail")
      (error) => console.log(error)
    );
    return unsubscribe;
  }, [user, loading]);

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
  }, [user, loading]);

  const handleAddTodo = useCallback(
    (event) => {
      event.preventDefault();
      if (input) {
        FirestoreService.createDocument(input, user)
          .then((res) => setTodos([res.newDocument, ...todos]))
          .then(() => setInput(""));
      }
    },
    [input]
  );

  const handleDeleteTodo = useCallback(
    (id) => {
      FirestoreService.deleteDocument(id).then(() =>
        setTodos(todos.filter((todo) => todo.id !== id))
      );
    },
    [todos]
  );

  const handleToggleComplete = useCallback(
    (id) => {
      const document = todos.find((todo) => todo.id === id);
      const updatedDocument = {
        checked: !document.checked,
        text: document.text,
      };

      FirestoreService.updateDocument(id, updatedDocument).then(() => {
        const updatedTodos = todos.map((todo) => {
          if (todo.id === id) {
            const updatedTodo = {
              ...todo,
              checked: !todo.checked,
            };
            return updatedTodo;
          }
          return todo;
        });
        setTodos(updatedTodos);
      });
    },
    [todos]
  );

  const handleEditTodo = useCallback(
    (id) => {
      setToggleEditById(id);

      const editTodo = todos.find((todo) => todo.id === id);
      setEditInput(editTodo.text);
    },
    [todos]
  );

  const handleSaveTodo = useCallback(
    (event) => {
      event.preventDefault();
      const id = toggleEditById;
      const document = todos.find((todo) => todo.id === id);

      const updatedDocument = {
        checked: document.checked,
        text: editInput,
      };

      FirestoreService.updateDocument(id, updatedDocument)
        .then(() => {
          const updatedTodos = todos.map((todo) => {
            if (todo.id === id) {
              const updatedTodo = {
                ...todo,
                text: editInput,
              };
              return updatedTodo;
            }
            return todo;
          });
          setTodos(updatedTodos);
        })
        .then(() => handleResetEdit());
    },
    [todos, toggleEditById, editInput]
  );

  const handleResetEdit = () => {
    setToggleEditById("");
    setEditInput("");
  };

  const allPosts = (
    <>
      {toggleEditById && (
        <form>
          <input
            onChange={(e) => setEditInput(e.target.value)}
            value={editInput}
          />
          <button type="submit" onClick={handleSaveTodo}>
            Save
          </button>
          <button type="button" onClick={handleResetEdit}>
            Discard
          </button>
        </form>
      )}
      {todos.map((todo) => {
        return (
          <TodoItem
            key={todo.id}
            todo={todo}
            handleToggleComplete={handleToggleComplete}
            handleEditTodo={handleEditTodo}
            handleDeleteTodo={handleDeleteTodo}
          />
        );
      })}
      {todos.length <= 0 && <p>There are no todos</p>}
    </>
  );

  return (
    <div className="App">
      <div className="dashboard">
        <div className="dashboard__container">
          Logged in as
          <div>{name}</div>
          <div>{user?.email}</div>
          <button className="dashboard__btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
      <form>
        <input onChange={(e) => setInput(e.target.value)} value={input} />
        <button type="submit" onClick={handleAddTodo}>
          Add todo
        </button>
      </form>
      <div>{allPosts}</div>
      {/* <div style={{ textAlign: "center" }}>
        {nextPosts_loading ? (
          <p>Loading..</p>
        ) : lastDocument ? (
          <button onClick={fetchMorePosts}>More Posts</button>
        ) : (
          <span>You are up to date!</span>
        )}
      </div> */}
    </div>
  );
}

export default Dashboard;
