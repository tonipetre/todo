const TodoItem = (props) => {
  const { todo, handleToggleComplete, handleEditTodo, handleDeleteTodo } =
    props;
  return (
    <div>
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
};

export default TodoItem;
