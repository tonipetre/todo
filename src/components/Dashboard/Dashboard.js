import { useEffect, useState } from "react";
import FirebaseService from "../../services/FirebaseService";
import "./dashboard.css";

import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../utils/firebase";
import { logout } from "../../services/FirebaseAuth";

import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { COLLECTION_REF } from "../../services/Constants";

function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [toggleEditById, setToggleEditById] = useState("");
  const [editInput, setEditInput] = useState("");

  const [lastDocument, setLastDocument] = useState("");
  const [nextPosts_loading, setNextPostsLoading] = useState(false);

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
  //   FirebaseService.listenToUpdates(user)
  //     .then((res) => {
  //       console.log("res", res.todos);
  //       setTodos(res.todos);
  //       // setLastDocument(res.lastDocument);
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

    const { todos, unsubscribe } = FirebaseService.listenToUpdates(user);
    setTodos(todos);

    console.log("todos in useEffect", todos);

    console.log("todos in useEffect length", todos.length);

    // return () => unsubscribe();
  }, [user, loading]);

  // const fetchMorePosts = () => {
  //   if (lastDocument) {
  //     setNextPostsLoading(true);
  //     FirebaseService.getNextBatch(lastDocument, user)
  //       .then((res) => {
  //         setLastDocument(res.lastDocument);
  //         setTodos([...todos, ...res.todos]);
  //         setNextPostsLoading(false);
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         setNextPostsLoading(false);
  //       });
  //   }
  // };

  const handleAddTodo = (event) => {
    event.preventDefault();
    if (input) {
      FirebaseService.createDocument(input, user)
        .then((res) => setTodos([res.newDocument, ...todos]))
        .then(() => setInput(""))
        .then(console.log(todos));
    }
    console.log("todos", todos);
  };

  const handleDeleteTodo = (id) => {
    FirebaseService.deleteDocument(id).then(() =>
      setTodos(todos.filter((todo) => todo.id !== id))
    );
  };

  const handleToggleComplete = (id) => {
    const document = todos.find((todo) => todo.id === id);
    const updatedDocument = {
      checked: !document.checked,
      text: document.text,
    };

    FirebaseService.updateDocument(id, updatedDocument).then(() => {
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
  };

  const handleEditTodo = (id) => {
    setToggleEditById(id);

    const editTodo = todos.find((todo) => todo.id === id);
    setEditInput(editTodo.text);
  };

  const handleSaveTodo = (event) => {
    event.preventDefault();
    const id = toggleEditById;
    const document = todos.find((todo) => todo.id === id);

    const updatedDocument = {
      checked: document.checked,
      text: editInput,
    };

    FirebaseService.updateDocument(id, updatedDocument)
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
  };

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
          <div key={todo.id}>
            <p
              style={{
                textDecoration: todo.checked ? "line-through" : "none",
              }}
            >
              {todo.text}
            </p>
            <button type="button" onClick={() => handleToggleComplete(todo.id)}>
              Toggle
            </button>
            <button type="button" onClick={() => handleEditTodo(todo.id)}>
              Edit
            </button>
            <button type="button" onClick={() => handleDeleteTodo(todo.id)}>
              X
            </button>
          </div>
        );
      })}
    </>
  );

  // const fetchUserName = async () => {
  //   try {
  //     const q = query(collection(db, "users"), where("uid", "==", user?.uid));
  //     const doc = await getDocs(q);
  //     const data = doc.docs[0].data();
  //     setName(data.name);
  //   } catch (err) {
  //     console.error(err);
  //     alert("An error occured while fetching user data");
  //   }
  // };

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
    // fetchUserName();
  }, [user, loading]);

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
